import { Controller, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { ValidatePromocodeDto } from './dto/validate-promocode.dto';
import { AccessJwtGuard } from 'src/common/guards/acessJwt.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Controller('discounts')
export class DiscountController {
  constructor(private discountService: DiscountService) {}

  @Post()
  @UseGuards(AccessJwtGuard, AdminGuard)
  createDiscount(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.createDiscount(createDiscountDto);
  }

  @Patch(':id')
  @UseGuards(AccessJwtGuard, AdminGuard)
  updateDiscount(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    return this.discountService.updateDiscount(id, updateDiscountDto);
  }

  @Delete(':id')
  @UseGuards(AccessJwtGuard, AdminGuard)
  deleteDiscount(@Param('id') id: string) {
    return this.discountService.deleteDiscount(id);
  }

  @Post('promocodes')
  @UseGuards(AccessJwtGuard, AdminGuard)
  createPromocode(@Body() createPromocodeDto: CreatePromocodeDto) {
    return this.discountService.createPromocode(createPromocodeDto);
  }

  @Post('promocodes/validate')
  validatePromocode(@Body() validatePromocodeDto: ValidatePromocodeDto) {
    return this.discountService.validatePromocode(validatePromocodeDto);
  }

  @Delete('promocodes/:id')
  @UseGuards(AccessJwtGuard, AdminGuard)
  deletePromocode(@Param('id') id: string) {
    return this.discountService.deletePromocode(id);
  }
}
