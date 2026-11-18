import { forwardRef, Module } from '@nestjs/common';
import { OrderController } from './order.controller.js';
import { OrderService } from './providers/order.service.js';
import { OrdersItemModule } from '../orders-item/orders-item.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity.js';
import { ProductModule } from '../product/product.module.js';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
  imports: [
    forwardRef(() => OrdersItemModule),
    TypeOrmModule.forFeature([Order]),
    ProductModule,
  ],
})
export class OrdersModule {}
