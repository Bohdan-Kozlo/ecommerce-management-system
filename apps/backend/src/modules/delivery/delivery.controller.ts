import { Controller, Get } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get('options')
  async getDeliveryOptions() {
    return this.deliveryService.getDeliveryOptions();
  }
}
