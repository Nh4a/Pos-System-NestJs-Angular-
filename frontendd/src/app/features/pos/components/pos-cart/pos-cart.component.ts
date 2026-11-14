import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosService } from '../../services/pos.service';

@Component({
  selector: 'app-pos-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-cart.component.html',
})
export class PosCartComponent {
  public posService = inject(PosService);

  public onQuantityChange(productId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (!isNaN(value)) {
      this.posService.updateQuantity(productId, value);
    }
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
