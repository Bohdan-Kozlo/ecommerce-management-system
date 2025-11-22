import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { ValidatePromocodeDto } from './dto/validate-promocode.dto';
import { Discount } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async createDiscount(createDiscountDto: CreateDiscountDto) {
    const { productId, startDate, endDate, ...rest } = createDiscountDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.prisma.discount.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        productId,
      },
      include: {
        product: true,
      },
    });
  }

  async updateDiscount(id: string, updateDiscountDto: UpdateDiscountDto) {
    const discount = await this.prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }

    const { startDate, endDate, productId, ...rest } = updateDiscountDto;

    if (productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
    }

    if (startDate && endDate) {
      if (new Date(startDate) >= new Date(endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const updateData: Partial<Discount> = { ...rest };

    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (productId) updateData.productId = productId;

    return this.prisma.discount.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
      },
    });
  }

  async deleteDiscount(id: string) {
    const discount = await this.prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }

    return this.prisma.discount.delete({
      where: { id },
    });
  }

  async createPromocode(createPromocodeDto: CreatePromocodeDto) {
    const code = uuidv4();

    return this.prisma.promocode.create({
      data: {
        code: code,
        value: createPromocodeDto.value,
        minOrderAmount: createPromocodeDto.minOrderAmount,
        maxUsage: createPromocodeDto.maxUsage,
        isActive: createPromocodeDto.isActive ?? true,
      },
    });
  }

  async findPromocodeByCode(code: string) {
    const promocode = await this.prisma.promocode.findUnique({
      where: { code },
    });

    if (!promocode) {
      throw new NotFoundException(`Promocode ${code} not found`);
    }

    return promocode;
  }

  async getAllDiscounts() {
    return this.prisma.discount.findMany({
      include: {
        product: {
          include: {
            productImages: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async getDiscountById(id: string) {
    const discount = await this.prisma.discount.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            productImages: true,
          },
        },
      },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }

    return discount;
  }

  async deletePromocode(id: string) {
    const promocode = await this.prisma.promocode.findUnique({
      where: { id },
    });

    if (!promocode) {
      throw new NotFoundException(`Promocode with ID ${id} not found`);
    }

    return this.prisma.promocode.delete({
      where: { id },
    });
  }

  async getAllPromocodes() {
    return this.prisma.promocode.findMany({
      orderBy: { usedCount: 'desc' },
    });
  }

  async getPromocodeById(id: string) {
    const promocode = await this.prisma.promocode.findUnique({
      where: { id },
    });

    if (!promocode) {
      throw new NotFoundException(`Promocode with ID ${id} not found`);
    }

    return promocode;
  }

  async updatePromocode(id: string, updateData: Partial<CreatePromocodeDto>) {
    const promocode = await this.prisma.promocode.findUnique({
      where: { id },
    });

    if (!promocode) {
      throw new NotFoundException(`Promocode with ID ${id} not found`);
    }

    return this.prisma.promocode.update({
      where: { id },
      data: updateData,
    });
  }

  async validatePromocode(validatePromocodeDto: ValidatePromocodeDto) {
    const { code, orderAmount } = validatePromocodeDto;

    const promocode = await this.prisma.promocode.findFirst({
      where: { code },
    });

    if (!promocode) {
      return {
        valid: false,
        message: `Promocode '${code}' not found`,
      };
    }

    if (!promocode.isActive) {
      return {
        valid: false,
        message: 'Promocode is inactive',
      };
    }

    if (promocode.usedCount >= promocode.maxUsage) {
      return {
        valid: false,
        message: 'Promocode usage limit reached',
      };
    }

    if (orderAmount < promocode.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount: $${promocode.minOrderAmount.toFixed(2)}`,
      };
    }

    const discountAmount = (orderAmount * promocode.value) / 100;

    return {
      valid: true,
      message: 'Promocode applied successfully',
      promocode: {
        id: promocode.id,
        code: promocode.code,
        value: promocode.value,
        minOrderAmount: promocode.minOrderAmount,
        maxUsage: promocode.maxUsage,
        usedCount: promocode.usedCount,
        isActive: promocode.isActive,
      },
      discountAmount: parseFloat(discountAmount.toFixed(2)),
    };
  }
}
