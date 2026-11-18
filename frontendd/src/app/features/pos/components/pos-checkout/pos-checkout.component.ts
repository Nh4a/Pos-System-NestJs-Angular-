import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosService } from '../../services/pos.service';
import { PaymentMethod } from '../../models/pos.model';
import { Order } from '../../services/order';

@Component({
  selector: 'app-pos-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-checkout.component.html',
  styleUrls: ['./pos-checkout.component.css'],
})
export class PosCheckoutComponent {
  public posService = inject(PosService);
  public orderService = inject(Order);

  public selectedMethod = signal<PaymentMethod>('cash');
  public cashTendered = signal<number>(0);

  public quickCashOptions = computed(() => {
    const total = this.posService.total();
    const options = new Set<number>();
    options.add(total); // Exact

    const roundUpToFive = Math.ceil(total / 5) * 5;
    if (roundUpToFive > total) options.add(roundUpToFive);

    const roundUpToTen = Math.ceil(total / 10) * 10;
    if (roundUpToTen > total) options.add(roundUpToTen);

    [10, 20, 50, 100].forEach((bill) => {
      if (bill >= total) options.add(bill);
    });

    return Array.from(options)
      .sort((a, b) => a - b)
      .slice(0, 5);
  });

  public changeAmount = computed(() => {
    if (this.selectedMethod() !== 'cash') return 0;
    const tendered = this.cashTendered();
    const total = this.posService.total();
    return tendered >= total ? Math.round((tendered - total) * 100) / 100 : 0;
  });

  public isCashSufficient = computed(() => {
    if (this.selectedMethod() !== 'cash') return true;
    return this.cashTendered() >= this.posService.total();
  });

  constructor() {
    // Default cash tendered to exact total
    this.cashTendered.set(this.posService.total());
  }

  public selectMethod(method: PaymentMethod): void {
    this.selectedMethod.set(method);
    if (method === 'cash') {
      this.cashTendered.set(this.posService.total());
    }
  }

  public setTenderAmount(amount: number): void {
    this.cashTendered.set(Math.round(amount * 100) / 100);
  }

  public onTenderInputChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.cashTendered.set(isNaN(val) ? 0 : val);
  }

  public submitPayment(): void {
    if (!this.isCashSufficient()) {
      this.posService.showToast(
        'Please enter an amount greater than or equal to total.',
        'warning',
      );
      return;
    }
    this.orderService.createOrder(this.selectedMethod(), this.cashTendered());
    this.posService.completeSale(this.selectedMethod(), this.cashTendered());
  }
}
