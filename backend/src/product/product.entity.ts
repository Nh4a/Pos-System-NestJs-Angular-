import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';
import { Category } from '../categories/category.entity.js';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  productName: string;

  @Column({
    type: 'decimal',
  })
  unitPrice: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  imageUrl?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  imagePublicId?: string;

  @Column()
  stockQty: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @ManyToOne(() => Category, (order) => order.product, {
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Relation<Category>;
}
