import { IsNumber, IsUUID } from 'class-validator';

export class UpdateCartItemQuantity {
  @IsUUID()
  productId!: string;

  @IsNumber()
  quantity!: number;
}
