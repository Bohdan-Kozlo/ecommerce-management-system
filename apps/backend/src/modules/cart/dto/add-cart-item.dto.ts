import { IsPositive, IsUUID } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  productId!: string;

  @IsPositive()
  quantity!: number;
}
