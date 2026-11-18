import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order } from '../order.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundError } from 'rxjs';
import { CreateOrderDto } from '../dtos/create-order.dto.js';
import { OrderItemService } from '../../orders-item/providers/order-item.service.js';
import { DataSource } from 'typeorm';
import { Product } from '../../product/product.entity.js';
import { ProductService } from '../../product/providers/product.service.js';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly orderItemService: OrderItemService,
    private readonly dataSource: DataSource,
    private readonly productService: ProductService,
  ) {}

  // createorder
  public async createOrder(createOrderDto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const requestItemMap = new Map<number, number>();

      for (const item of createOrderDto.products) {
        requestItemMap.set(item.productId, item.quantity ?? 0);
      }

      const itemIds = [...requestItemMap.keys()];

      const products = await this.productService.findAndLockProducts(
        manager,
        itemIds,
      );

      if (products.length < createOrderDto.products.length) {
        console.log(products.length);
        throw new NotFoundException('Some product are not found');
      }

      await this.productService.deductStockQuantity(
        manager,
        products,
        requestItemMap,
      );

      const orderRepo = manager.getRepository(Order);
      const uuid = crypto.randomUUID().split('-')[0];
      const receiptNumber = `ORDER:${uuid}-${Date.now()}`;
      const total = products.reduce(
        (sum, currentValue) =>
          sum + currentValue.unitPrice * requestItemMap.get(currentValue.id)!,
        0,
      );

      const newOrder = orderRepo.create({
        ...createOrderDto,
        receiptNumber,
        itemCount: products.length,
        total,
      });

      const createdOrder = await orderRepo.save(newOrder);

      const orderItems = await Promise.all(
        products.map((product) => {
          return this.orderItemService.creatOrderItem(
            manager,
            createdOrder,
            product,
            requestItemMap.get(product.id)!,
          );
        }),
      );
      return {
        message: 'Order created successfully',
        order: {
          receiptNumber: createdOrder.receiptNumber,
          itemCount: createdOrder.itemCount,
          total: createdOrder.total,
          paymentMethod: createdOrder.paymentMethod,
          createdAt: createdOrder.createdAt,
        },
        orderItems: orderItems,
      };
    });
  }

  // get all order
  public async findOrderById(orderId: string) {
    try {
      const order = await this.orderRepo.findOneBy({ orderId });
      if (!order) {
        throw new NotFoundException('');
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Order not found');
      }
      throw new InternalServerErrorException('Server error');
    }
  }
}
