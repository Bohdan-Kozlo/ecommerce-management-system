import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AccessJwtGuard } from 'src/common/guards/acessJwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/types';
import { ChangeStatusOrderDto } from './dto/change-status-order.dto';

@Controller('orders')
@UseGuards(AccessJwtGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  async createOrder(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrderFromCart(user.userId, dto);
  }

  @Get()
  async getOrders(@CurrentUser() user: AuthUser) {
    return this.orderService.getUserOrders(user.userId);
  }

  @Get(':id')
  async getOrdersById(@CurrentUser() user: AuthUser, @Param('id') orderId: string) {
    return this.orderService.getUserOrderById(user.userId, orderId);
  }

  @Patch(':id/status')
  async changeOrderStatus(@Param('id') orderId: string, @Body() dto: ChangeStatusOrderDto) {
    return this.orderService.changeOrderStatus(orderId, dto);
  }
}
