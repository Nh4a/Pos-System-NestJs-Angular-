import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../models/product/product';
import { ProductFormValue } from '../../../models/product/create-product-form';

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    productName: 'Iced Caramel Macchiato',
    unitPrice: 4.5,
    stockQty: 24,
    description: 'Freshly brewed espresso with steamed milk and vanilla syrup, topped with caramel drizzle.',
    imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 2,
    productName: 'Matcha Green Tea Latte',
    unitPrice: 4.25,
    stockQty: 18,
    description: 'Smooth and creamy premium Japanese matcha green tea blended with steamed milk.',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 3,
    productName: 'Classic Americano',
    unitPrice: 3.0,
    stockQty: 40,
    description: 'Rich, full-bodied espresso shots topped with hot or cold water for a clean coffee profile.',
    imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 4,
    productName: 'Butter Croissant',
    unitPrice: 2.75,
    stockQty: 15,
    description: 'Flaky, golden-brown artisanal pastry baked fresh with 100% French cultured butter.',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 5,
    productName: 'Blueberry Muffin',
    unitPrice: 3.2,
    stockQty: 8,
    description: 'Moist and fluffy bakery muffin bursting with fresh wild blueberries and sugar crumble.',
    imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 6,
    productName: 'New York Cheesecake',
    unitPrice: 5.5,
    stockQty: 6,
    description: 'Creamy and rich traditional cheesecake on a buttery graham cracker crust.',
    imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 7,
    productName: 'Cold Brew Coffee',
    unitPrice: 4.0,
    stockQty: 30,
    description: 'Steeped for 20 hours for a silky, ultra-smooth and naturally sweet coffee flavor.',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 8,
    productName: 'Double Chocolate Cookie',
    unitPrice: 2.25,
    stockQty: 3,
    description: 'Decadent Belgian cocoa cookie packed with melted dark chocolate chunks.',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop&q=60',
  },
];

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
        if (data && data.length > 0) {
          this.products.set([...data]);
        } else if (this.products().length === 0) {
          // If backend returns empty, provide demo products so POS is ready to use
          this.products.set(DEFAULT_PRODUCTS);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Backend API unavailable. Using fallback product catalog:', err.message);
        if (this.products().length === 0) {
          this.products.set(DEFAULT_PRODUCTS);
        }
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
