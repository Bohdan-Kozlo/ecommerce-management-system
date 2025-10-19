import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { OrderProcessingContext } from './order-processing.types';
import { OrderProcessingHandler } from './order-processing.handler';

export class ReservationHandler extends OrderProcessingHandler {
  protected async process(context: OrderProcessingContext): Promise<OrderProcessingContext> {
    if (!context.cart) {
      throw new InternalServerErrorException('Cart context is missing during reservation');
    }

    for (const item of context.cart.cartItems) {
      const { count } = await context.prisma.product.updateMany({
        where: {
          id: item.productId,
          stock: {
            gte: item.quantity,
          },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      if (count === 0) {
        throw new BadRequestException(`Unable to reserve product ${item.product.name}`);
      }
    }

    return context;
  }
}
