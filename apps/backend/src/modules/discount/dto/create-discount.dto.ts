import { IsString, IsNumber, IsDate, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiscountDto {
  @IsNumber()
  @Min(0)
  value!: number;

  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @IsDate()
  @Type(() => Date)
  endDate!: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  productId!: string;
}
