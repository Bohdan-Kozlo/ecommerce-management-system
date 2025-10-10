import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { Cart, CartItem } from '@prisma/client';
import { UpdateCartItemQuantity } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getUserCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    return cart;
  }

  async addItemToCart(userId: string, dto: AddCartItemDto) {
    const { productId, quantity } = dto;

    const cart = await this.findOrCreateCart(userId);
    return await this.addItemToExistingCart(cart, productId, quantity);
  }

  async updateCartItemQuantity(userId: string, dto: UpdateCartItemQuantity) {
    const { productId, quantity } = dto;

    const cartItem = await this.findCartItemByUserAndProduct(userId, productId);

    await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    return cartItem;
  }

  async removeItemFromCart(userId: string, productId: string) {
    const cartItem = await this.findCartItemByUserAndProduct(userId, productId);

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return cartItem;
  }

  async cleanCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cart.delete({
      where: { id: cart.id },
    });

    return { cartId: cart.id };
  }

  private async findOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { cartItems: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { cartItems: true },
      });
    }

    return cart;
  }

  private async addItemToExistingCart(
    cart: Cart & { cartItems: CartItem[] },
    productId: string,
    quantity: number,
  ) {
    const existingCartItem = cart.cartItems.find((item) => item.productId === productId);

    if (existingCartItem) {
      return await this.updateExistingCartItem(existingCartItem, quantity);
    } else {
      return await this.createNewCartItem(cart.id, productId, quantity);
    }
  }

  private async updateExistingCartItem(cartItem: CartItem, additionalQuantity: number) {
    const newQuantity = cartItem.quantity + additionalQuantity;
    return await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: newQuantity },
    });
  }

  private async createNewCartItem(cartId: string, productId: string, quantity: number) {
    return await this.prisma.cartItem.create({
      data: { cartId, productId, quantity },
    });
  }

  private async findCartItemByUserAndProduct(userId: string, productId: string): Promise<CartItem> {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        productId,
        cart: {
          userId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return cartItem;
  }
}
