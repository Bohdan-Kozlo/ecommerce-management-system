import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ProductModule,
    CategoryModule,
  ],
})
export class AppModule {}
