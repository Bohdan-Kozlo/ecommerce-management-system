import { OrderProcessingContext } from './order-processing.types';

export abstract class OrderProcessingHandler {
  private next?: OrderProcessingHandler;

  setNext(handler: OrderProcessingHandler): OrderProcessingHandler {
    this.next = handler;
    return handler;
  }

  async handle(context: OrderProcessingContext): Promise<OrderProcessingContext> {
    const updatedContext = await this.process(context);

    if (this.next) {
      return this.next.handle(updatedContext);
    }

    return updatedContext;
  }

  protected abstract process(context: OrderProcessingContext): Promise<OrderProcessingContext>;
}
