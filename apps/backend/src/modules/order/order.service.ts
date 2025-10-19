import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderProcessingContext } from './handlers/order-processing.types';
import { OrderProcessingHandler } from './handlers/order-processing.handler';
import { CartValidationHandler } from './handlers/cart-validation.handler';
import { StockValidationHandler } from './handlers/stock-validation.handler';
import { DiscountHandler } from './handlers/discount.handler';
import { PromotionHandler } from './handlers/promotion.handler';
import { ReservationHandler } from './handlers/reservation.handler';
import { OrderBuilder } from './builder/order.builder';
import { OrderDirector } from './builder/order.director';
import { ChangeStatusOrderDto } from './dto/change-status-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrderFromCart(userId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const context: OrderProcessingContext = {
        prisma: tx,
        userId,
        promocodeCode: dto.promocode,
        now: new Date(),
      };

      const chain = this.createOrderProcessingChain();
      const processedContext = await chain.handle(context);

      if (!processedContext.pricedItems || processedContext.pricedItems.length === 0) {
        throw new InternalServerErrorException('Order items were not prepared correctly');
      }

      const orderDirector = new OrderDirector(new OrderBuilder());
      const orderData = orderDirector.buildOrder({
        userId: processedContext.userId,
        totalAmount: processedContext.total ?? 0,
        items: processedContext.pricedItems,
        promocode: processedContext.appliedPromocode,
      });

      const order = await tx.order.create({
        data: orderData,
        include: {
          orderItems: true,
        },
      });

      if (processedContext.appliedPromocode) {
        await tx.promocode.update({
          where: { id: processedContext.appliedPromocode.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (processedContext.cart) {
        await tx.cart.delete({
          where: { id: processedContext.cart.id },
        });
      }

      return order;
    });
  }

  async getUserOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: true },
    });

    if (!orders || orders.length === 0) {
      throw new NotFoundException('No orders found for this user');
    }

    return orders;
  }

  async getUserOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found for this user');
    }

    return order;
  }

  async changeOrderStatus(orderId: string, status: ChangeStatusOrderDto) {
    const updatedOrder = await this.prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status.status },
    });
  }

  private createOrderProcessingChain(): OrderProcessingHandler {
    const cartValidation = new CartValidationHandler();
    const stockValidation = new StockValidationHandler();
    const discount = new DiscountHandler();
    const promotion = new PromotionHandler();
    const reservation = new ReservationHandler();

    cartValidation
      .setNext(stockValidation)
      .setNext(discount)
      .setNext(promotion)
      .setNext(reservation);

    return cartValidation;
  }
}
