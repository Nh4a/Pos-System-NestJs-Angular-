import { Injectable } from '@nestjs/common';
import { CreateOrderItem } from '../dtos/order-item.dto.js';
import { Product } from '../../product/product.entity.js';
import { EntityManager } from 'typeorm';
import { OrderItem } from '../order-item.entity.js';
import { Order } from '../../orders/order.entity.js';

@Injectable()
export class OrderItemService {
  public async creatOrderItem(
    manager: EntityManager,
    order: Order,
    product: Product,
    qty: number,
  ) {
    const ordRepo = manager.getRepository(OrderItem);
    const subTotal = product.unitPrice * qty;
    const newOrderItem = ordRepo.create({
      product,
      order,
      price: product.unitPrice,
      subtotal: subTotal,
      quantity: qty,
      productName: product.productName,
    });
    const savedItem = await ordRepo.save(newOrderItem);

    return {
      quantity: savedItem.quantity,
      price: Number(savedItem.price),
      subtotal: Number(savedItem.subtotal),
      productName: savedItem.productName,
    };
  }
}
