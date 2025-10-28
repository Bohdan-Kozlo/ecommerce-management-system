import { Type } from 'class-transformer';
import { DeliveryMethod } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class DeliveryInfoDto {
  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(DeliveryMethod)
  method!: DeliveryMethod;
}

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;

  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  delivery!: DeliveryInfoDto;
}
