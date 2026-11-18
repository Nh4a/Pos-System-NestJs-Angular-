import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from '../orders-item/order-item.entity.js';
import { PaymentMethod } from './enums/payment-method.enum.js';



@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  orderId: string;

  @Column({ unique: true })
  receiptNumber: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items: OrderItem[];

  @Column({ type: 'int' })
  itemCount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;
  change?: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
