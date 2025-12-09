import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OrderProcessingContext } from './order-processing.types';
import { OrderProcessingHandler } from './order-processing.handler';

@Injectable()
export class DeliveryCalculationHandler extends OrderProcessingHandler {
  protected async process(context: OrderProcessingContext): Promise<OrderProcessingContext> {
    if (!context.deliveryMethod) {
      return context;
    }

    const deliveryOption = await context.prisma.deliveryOption.findUnique({
      where: { method: context.deliveryMethod },
    });

    if (!deliveryOption) {
      throw new InternalServerErrorException(
        `Delivery method ${context.deliveryMethod} not found in database`,
      );
    }

    const deliveryPrice = deliveryOption.price;

    context.total = (context.total || 0) + deliveryPrice;

    return context;
  }
}
