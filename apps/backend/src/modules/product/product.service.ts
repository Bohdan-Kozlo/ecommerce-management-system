import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { SupabaseStorageService } from 'src/common/supabaseStorage/supabaseStorage.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseStorageService,
  ) {}

  async create(createProductDto: CreateProductDto, imageFiles?: Express.Multer.File[]) {
    try {
      const { images, ...productData } = createProductDto;

      const product = await this.prisma.product.create({
        data: productData,
      });

      const uploadedImageUrls: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const url = await this.supabase.uploadFile(file);
          uploadedImageUrls.push(url);
        }
      }

      if (images && images.length > 0) {
        uploadedImageUrls.push(...images);
      }

      if (uploadedImageUrls.length > 0) {
        await this.prisma.productImage.createMany({
          data: uploadedImageUrls.map((url) => ({ url, productId: product.id })),
        });
      }

      return this.prisma.product.findUnique({
        where: { id: product.id },
        include: { productImages: true, Category: true },
      });
    } catch (error) {
      throw new Error(
        `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        productImages: true,
        Category: true,
        discount: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findAll(query: QueryProductsDto) {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10 } = query;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sort) {
      const [field, order] = sort.split('_');
      if (field && (field === 'price' || field === 'name' || field === 'createdAt')) {
        orderBy[field] = order === 'asc' ? 'asc' : 'desc';
      }
    } else {
      orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          productImages: true,
          Category: true,
          discount: {
            where: {
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, imageFiles?: Express.Multer.File[]) {
    try {
      const { images, ...updateData } = updateProductDto;

      await this.findById(id);

      await this.prisma.product.update({
        where: { id },
        data: updateData,
      });

      if (imageFiles && imageFiles.length > 0) {
        const uploadedImageUrls: string[] = [];
        for (const file of imageFiles) {
          const url = await this.supabase.uploadFile(file);
          uploadedImageUrls.push(url);
        }

        const existingImageUrls = images || [];
        const allImageUrls = [...existingImageUrls, ...uploadedImageUrls];

        await this.prisma.productImage.deleteMany({
          where: { productId: id },
        });

        if (allImageUrls.length > 0) {
          await this.prisma.productImage.createMany({
            data: allImageUrls.map((url) => ({ url, productId: id })),
          });
        }
      } else if (images !== undefined) {
        await this.prisma.productImage.deleteMany({
          where: { productId: id },
        });

        if (images.length > 0) {
          await this.prisma.productImage.createMany({
            data: images.map((url) => ({ url, productId: id })),
          });
        }
      }

      return this.prisma.product.findUnique({
        where: { id },
        include: { productImages: true, Category: true },
      });
    } catch (error) {
      throw new Error(
        `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async delete(id: string) {
    const deletedProduct = await this.findById(id);
    if (!deletedProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { productId: deletedProduct.id };
  }
}
