export interface Product {
  id: number;
  productName: string;
  unitPrice: number;
  imageUrl?: string;
  imagePublicId?: string;
  stockQty: number;
  description?: string;
}
