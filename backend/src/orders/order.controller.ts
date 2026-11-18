import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './providers/order.service.js';
import { CreateOrderDto } from './dtos/create-order.dto.js';

@Controller('api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  public createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }
}
