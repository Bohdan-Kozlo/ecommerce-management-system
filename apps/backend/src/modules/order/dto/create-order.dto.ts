import { IsOptional, IsString, IsEmail, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryMethod } from '@prisma/client';

export class DeliveryDto {
  @IsString()
  address!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(DeliveryMethod)
  method!: DeliveryMethod;
}

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  promocode?: string;

  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery!: DeliveryDto;
}
