import { IsString, IsNumber, Min } from 'class-validator';

export class ValidatePromocodeDto {
  @IsString()
  code!: string;

  @IsNumber()
  @Min(0)
  orderAmount!: number;
}
