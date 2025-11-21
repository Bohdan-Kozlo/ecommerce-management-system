import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DiscountModule } from '../discount/discount.module';

@Module({
  imports: [DiscountModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
