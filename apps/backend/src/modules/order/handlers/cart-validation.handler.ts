import { BadRequestException } from '@nestjs/common';
import { OrderProcessingContext } from './order-processing.types';
import { OrderProcessingHandler } from './order-processing.handler';

export class CartValidationHandler extends OrderProcessingHandler {
  protected async process(context: OrderProcessingContext): Promise<OrderProcessingContext> {
    const cart = await context.prisma.cart.findUnique({
      where: { userId: context.userId },
      include: {
        cartItems: {
          include: {
            product: {
              include: {
                discount: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    context.cart = cart;
    context.subtotal = cart.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
    context.total = context.subtotal;

    return context;
  }
}
