import { Controller, Post, Patch, Delete, Body, Param, Get } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { ValidatePromocodeDto } from './dto/validate-promocode.dto';
import { AdminAuth } from 'src/common/decorators/auth.decorator';

@Controller('discounts')
export class DiscountController {
  constructor(private discountService: DiscountService) {}

  @Get('promocodes')
  @AdminAuth()
  getAllPromocodes() {
    return this.discountService.getAllPromocodes();
  }

  @Get('promocodes/:id')
  @AdminAuth()
  getPromocodeById(@Param('id') id: string) {
    return this.discountService.getPromocodeById(id);
  }

  @Post('promocodes')
  @AdminAuth()
  createPromocode(@Body() createPromocodeDto: CreatePromocodeDto) {
    return this.discountService.createPromocode(createPromocodeDto);
  }

  @Patch('promocodes/:id')
  @AdminAuth()
  updatePromocode(@Param('id') id: string, @Body() updateData: Partial<CreatePromocodeDto>) {
    return this.discountService.updatePromocode(id, updateData);
  }

  @Post('promocodes/validate')
  validatePromocode(@Body() validatePromocodeDto: ValidatePromocodeDto) {
    return this.discountService.validatePromocode(validatePromocodeDto);
  }

  @Delete('promocodes/:id')
  @AdminAuth()
  deletePromocode(@Param('id') id: string) {
    return this.discountService.deletePromocode(id);
  }

  @Get()
  @AdminAuth()
  getAllDiscounts() {
    return this.discountService.getAllDiscounts();
  }

  @Get(':id')
  @AdminAuth()
  getDiscountById(@Param('id') id: string) {
    return this.discountService.getDiscountById(id);
  }

  @Post()
  @AdminAuth()
  createDiscount(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.createDiscount(createDiscountDto);
  }

  @Patch(':id')
  @AdminAuth()
  updateDiscount(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    return this.discountService.updateDiscount(id, updateDiscountDto);
  }

  @Delete(':id')
  @AdminAuth()
  deleteDiscount(@Param('id') id: string) {
    return this.discountService.deleteDiscount(id);
  }
}
