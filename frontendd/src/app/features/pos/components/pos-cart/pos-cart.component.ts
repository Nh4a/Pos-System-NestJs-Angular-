import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosService } from '../../services/pos.service';
import { PaymentMethod } from '../../models/pos.model';

@Component({
  selector: 'app-pos-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-cart.component.html',
})
export class PosCartComponent {
  public posService = inject(PosService);

  public onCustomerChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.posService.selectedCustomer.set(val);
  }

  public onPaymentMethodChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as PaymentMethod;
    this.posService.selectedPaymentMethod.set(val);
  }

  public onMakeOrder(): void {
    this.posService.openCheckout();
  }

  public onTaxRateChange(event: Event): void {
    const val = Number((event.target as HTMLSelectElement).value);
    this.posService.taxRate.set(val);
  }

  public onDiscountRateChange(event: Event): void {
    const val = Number((event.target as HTMLSelectElement).value);
    this.posService.discountRate.set(val);
  }
}
