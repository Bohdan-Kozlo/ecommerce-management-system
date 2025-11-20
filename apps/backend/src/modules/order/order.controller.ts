import { Body, Controller, Get, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AccessJwtGuard } from 'src/common/guards/acessJwt.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/types';
import { ChangeStatusOrderDto } from './dto/change-status-order.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

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

  @Get('admin/all')
  @UseGuards(AdminGuard)
  async getAllOrders(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.orderService.getAllOrders({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('admin/:id')
  @UseGuards(AdminGuard)
  async getOrderByIdAdmin(@Param('id') orderId: string) {
    return await this.orderService.getOrderById(orderId);
  }

  @Get(':id')
  async getOrdersById(@CurrentUser() user: AuthUser, @Param('id') orderId: string) {
    return this.orderService.getUserOrderById(user.userId, orderId);
  }

  @Patch('admin/:id/status')
  @UseGuards(AdminGuard)
  async changeOrderStatusAdmin(@Param('id') orderId: string, @Body() dto: ChangeStatusOrderDto) {
    return this.orderService.changeOrderStatus(orderId, dto);
  }

  @Patch('admin/:id/delivery')
  @UseGuards(AdminGuard)
  async updateDelivery(@Param('id') orderId: string, @Body() dto: UpdateDeliveryDto) {
    return await this.orderService.updateDelivery(orderId, dto);
  }

  @Patch('admin/:id/cancel')
  @UseGuards(AdminGuard)
  async cancelOrder(@Param('id') orderId: string) {
    return await this.orderService.cancelOrder(orderId);
  }

  @Patch(':id/status')
  async changeOrderStatus(@Param('id') orderId: string, @Body() dto: ChangeStatusOrderDto) {
    return this.orderService.changeOrderStatus(orderId, dto);
  }
}
