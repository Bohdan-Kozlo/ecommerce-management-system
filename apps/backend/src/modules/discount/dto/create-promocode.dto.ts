import { IsNumber, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreatePromocodeDto {
  @IsNumber()
  @Min(0)
  value!: number;

  @IsNumber()
  @Min(0)
  minOrderAmount!: number;

  @IsInt()
  @Min(1)
  maxUsage!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
