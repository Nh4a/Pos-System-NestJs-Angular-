import { IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderItem {
  @IsInt()
  @IsNotEmpty()
  productId: number;
  
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
