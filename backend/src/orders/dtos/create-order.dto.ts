import { IsArray, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../enums/payment-method.enum.js';
import { CreateOrderItem } from '../../orders-item/dtos/order-item.dto.js';

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItem)
  products: CreateOrderItem[];

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
