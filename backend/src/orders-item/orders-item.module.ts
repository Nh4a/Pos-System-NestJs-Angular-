import { forwardRef, Module } from '@nestjs/common';
import { OrderItemService } from './providers/order-item.service.js';
import { ProductModule } from '../product/product.module.js';
import { OrdersModule } from '../orders/orders.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity.js';
import { Order } from '../orders/order.entity.js';

@Module({
  providers: [OrderItemService],
  exports: [OrderItemService],
  imports: [forwardRef(()=>OrdersModule), ProductModule, TypeOrmModule.forFeature([OrderItem, Order])]
})
export class OrdersItemModule {}
