import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { AdminAuth } from 'src/common/decorators/auth.decorator';
import { imageFileFilter, fileSizeLimit } from 'src/common/utils/file-upload.utils';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @AdminAuth()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      fileFilter: imageFileFilter,
      limits: { fileSize: fileSizeLimit },
    }),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.productService.create(createProductDto, images);
  }

  @Patch(':id')
  @AdminAuth()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      fileFilter: imageFileFilter,
      limits: { fileSize: fileSizeLimit },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ) {
    return this.productService.update(id, updateProductDto, images);
  }

  @Delete(':id')
  @AdminAuth()
  delete(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
