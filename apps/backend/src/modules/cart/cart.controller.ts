import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemQuantity } from './dto/update-cart-item.dto';
import { AccessJwtGuard } from 'src/common/guards/acessJwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/types';

@Controller('cart')
@UseGuards(AccessJwtGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getUserCart(@CurrentUser() user: AuthUser) {
    return this.cartService.getUserCart(user.userId);
  }

  @Post('items')
  async addItemToCart(@CurrentUser() user: AuthUser, @Body() dto: AddCartItemDto) {
    return await this.cartService.addItemToCart(user.userId, dto);
  }

  @Put('items')
  async updateCartItemQuantity(@CurrentUser() user: AuthUser, @Body() dto: UpdateCartItemQuantity) {
    return await this.cartService.updateCartItemQuantity(user.userId, dto);
  }

  @Delete('items/:productId')
  async removeItemFromCart(@CurrentUser() user: AuthUser, @Param('productId') productId: string) {
    return await this.cartService.removeItemFromCart(user.userId, productId);
  }

  @Delete()
  async cleanCart(@CurrentUser() user: AuthUser) {
    return await this.cartService.cleanCart(user.userId);
  }
}
