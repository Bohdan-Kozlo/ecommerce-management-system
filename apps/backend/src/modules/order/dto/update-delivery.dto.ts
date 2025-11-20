import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { DeliveryMethod } from '@prisma/client';

export class UpdateDeliveryDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(DeliveryMethod)
  method?: DeliveryMethod;
}
