import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { DiscountModule } from './modules/discount/discount.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ProductModule,
    CategoryModule,
    CartModule,
    OrderModule,
    DiscountModule,
  ],
})
export class AppModule {}
