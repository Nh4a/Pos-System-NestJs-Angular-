import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../models/product/product';
import { ProductForm, ProductFormValue } from '../../../models/product/create-product-form';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  public productForm: null | Product = null;
  public isSubmitting = signal<boolean>(false);
  private readonly API_URL = 'http://localhost:3000/api/product';

  private products = signal<Product[]>([]);

  constructor(private readonly httpClient: HttpClient) {}

  public fetchProducts() {
    this.httpClient.get<Product[]>('http://localhost:3000/api/product').subscribe({
      next: (data) => {
        this.products.set([...data]);
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

  public getAllProducts() {
    return this.products();
  }

  public onSubmit(event: ProductFormValue) {
    this.isSubmitting.update((val) => (val = true));
    const frmData = new FormData();

    Object.entries(event).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        frmData.append(key, value instanceof File ? value : String(value));
      }
    });
    // Post product
    console.log(event);
    if (!event.id) {
      this.httpClient.post<Product>(this.API_URL, frmData).subscribe({
        next: (data) => {
          this.products.set([data, ...this.products()]);
          console.log(data);
          this.onResetForm();
        },
        complete: () => {
          this.isSubmitting.update((val) => (val = false));
        },
      });

      return;
    }

    //put product
    this.httpClient.put<Product>(this.API_URL + `/${event.id}`, frmData).subscribe({
      next: (data) => {
        this.products.update((products) => {
          return products.map((item) => {
            if (item.id == event.id) {
              return data;
            }
            return item;
          });
        });
        this.productForm=null
        this.onResetForm();
      },
      complete: () => {
        this.isSubmitting.update((val) => (val = false));
      },
    });
  }

  public onDelete(id: number) {
    this.isSubmitting.update((val) => (val = true));
    this.httpClient.delete<Product>(`${this.API_URL}/${id}`).subscribe({
      next: (data) => {
        console.log('data : ', data);
        this.products.set([...this.products()].filter((item) => item.id !== id));
      },
      complete: () => {
        this.isSubmitting.update((val) => (val = false));
      },
    });
  }
}
