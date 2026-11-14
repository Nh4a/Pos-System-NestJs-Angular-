import { Product } from '../../../models/product/product';

export type PaymentMethod = 'cash' | 'card' | 'qr';

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface POSOrder {
  orderId: string;
  receiptNumber: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  discountRate: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
  change?: number;
  createdAt: string;
  cashierName: string;
  customerName?: string;
}

export interface HeldOrder {
  id: string;
  label: string;
  items: CartItem[];
  total: number;
  createdAt: string;
}

export type ProductStockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
export type ProductSortOption = 'name' | 'price-asc' | 'price-desc' | 'stock';
