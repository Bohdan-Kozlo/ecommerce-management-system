import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { OrderProcessingContext } from './order-processing.types';
import { OrderProcessingHandler } from './order-processing.handler';

export class StockValidationHandler extends OrderProcessingHandler {
  protected process(context: OrderProcessingContext): Promise<OrderProcessingContext> {
    if (!context.cart) {
      throw new InternalServerErrorException('Cart context is missing during stock validation');
    }

    const insufficientItem = context.cart.cartItems.find(
      (item) => item.product.stock < item.quantity,
    );

    if (insufficientItem) {
      throw new BadRequestException(
        `Not enough stock for product ${insufficientItem.product.name}`,
      );
    }

    return Promise.resolve(context);
  }
}
