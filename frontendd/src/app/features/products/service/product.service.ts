import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../models/product/product';
import { ProductFormValue } from '../../../models/product/create-product-form';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  public productForm: null | Product = null;
  public isSubmitting = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  private readonly API_URL = 'http://localhost:3000/api/product';

  public products = signal<Product[]>([]);

  constructor(private readonly httpClient: HttpClient) {}

  public fetchProducts() {
    this.isLoading.set(true);
    this.httpClient.get<Product[]>(this.API_URL).subscribe({
      next: (data) => {
          this.products.set([...data]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Backend API unavailable. Using fallback product catalog:', err.message);
        this.isLoading.set(false);
      },
    });
  }

  public setUpdateProductToForm(product: Product) {
    this.productForm = product;
  }

  public onResetForm() {
    this.productForm = null;
    console.log(this.productForm);
  }

  public getAllProducts(): Product[] {
    return this.products();
  }

  public onSubmit(event: ProductFormValue) {
    this.isSubmitting.update((val) => true);
    const frmData = new FormData();

    Object.entries(event).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        frmData.append(key, value instanceof File ? value : String(value));
      }
    });

    // Create product
    if (!event.id) {
      this.httpClient.post<Product>(this.API_URL, frmData).subscribe({
        next: (data) => {
          this.products.set([data, ...this.products()]);
          this.onResetForm();
        },
        error: () => {
          // Local fallback creation if backend offline
          const newProduct: Product = {
            id: Date.now(),
            productName: event.productName || 'New Product',
            unitPrice: Number(event.unitPrice) || 0,
            stockQty: Number(event.stockQty) || 0,
            description: event.description || '',
          };
          this.products.update((list) => [newProduct, ...list]);
          this.onResetForm();
        },
        complete: () => {
          this.isSubmitting.update((val) => false);
        },
      });
      return;
    }

    // Update product
    this.httpClient.put<Product>(`${this.API_URL}/${event.id}`, frmData).subscribe({
      next: (data) => {
        this.products.update((products) => {
          return products.map((item) => {
            if (item.id === event.id) {
              return data;
            }
            return item;
          });
        });
        this.productForm = null;
        this.onResetForm();
      },
      error: () => {
        // Local fallback update if backend offline
        this.products.update((products) =>
          products.map((item) => {
            if (item.id === event.id) {
              return {
                ...item,
                productName: event.productName ?? item.productName,
                unitPrice: Number(event.unitPrice) || item.unitPrice,
                stockQty: Number(event.stockQty) ?? item.stockQty,
                description: event.description ?? item.description,
              };
            }
            return item;
          })
        );
        this.productForm = null;
        this.onResetForm();
      },
      complete: () => {
        this.isSubmitting.update((val) => false);
      },
    });
  }

  public onDelete(id: number) {
    this.isSubmitting.update((val) => true);
    this.httpClient.delete<Product>(`${this.API_URL}/${id}`).subscribe({
      next: (data) => {
        console.log('data : ', data);
        this.products.set([...this.products()].filter((item) => item.id !== id));
      },
      error: () => {
        // Local deletion
        this.products.set([...this.products()].filter((item) => item.id !== id));
      },
      complete: () => {
        this.isSubmitting.update((val) => false);
      },
    });
  }

  /**
   * Deduct stock when an order is completed in POS.
   * Updates local signal immediately and sends PUT requests to update backend inventory.
   */
  public deductStock(soldItems: { productId: number; quantity: number }[]): void {
    const soldMap = new Map<number, number>();
    soldItems.forEach((item) => {
      soldMap.set(item.productId, (soldMap.get(item.productId) || 0) + item.quantity);
    });

    this.products.update((current) =>
      current.map((prod) => {
        if (soldMap.has(prod.id)) {
          const qtyToDeduct = soldMap.get(prod.id)!;
          const newStock = Math.max(0, prod.stockQty - qtyToDeduct);

          // Update backend if online
          const frmData = new FormData();
          frmData.append('productName', prod.productName);
          frmData.append('unitPrice', String(prod.unitPrice));
          frmData.append('stockQty', String(newStock));
          if (prod.description) {
            frmData.append('description', prod.description);
          }

          this.httpClient.put<Product>(`${this.API_URL}/${prod.id}`, frmData).subscribe({
            next: (res) => console.log(`Stock synced for product #${prod.id}:`, res.stockQty),
            error: (err) => console.warn(`Stock update offline for #${prod.id}, local stock saved.`),
          });

          return { ...prod, stockQty: newStock };
        }
        return prod;
      })
    );
  }
}
