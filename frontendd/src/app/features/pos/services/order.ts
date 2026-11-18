import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PosService } from './pos.service';
import { CreateOrderResponse, PaymentMethod } from '../models/pos.model';

@Injectable({
  providedIn: 'root',
})
export class Order {
  constructor(
    private readonly http: HttpClient,
    private readonly posService: PosService,
  ) {}
  public createOrderResponse = signal<CreateOrderResponse | null>(null);

  public createOrder(paymentMethod: PaymentMethod, cashTendered:number) {
    const productToOrder = [...this.posService.cart()].map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));
    const orderPayload = {
      paymentMethod: paymentMethod,
      products: productToOrder,
    };
    this.http.post<CreateOrderResponse>(`http://localhost:3000/api/order`, orderPayload).subscribe({
      next: (response: CreateOrderResponse) => {
        this.createOrderResponse.set(response);
        // this.posService.completeSale(selectedMethod());
        this.posService.completeSale(paymentMethod, cashTendered);
        console.log(response);
        console.log('createOrderResponse', this.createOrderResponse());
      },
    });
  }
}
