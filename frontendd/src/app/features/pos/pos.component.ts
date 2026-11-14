import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PosService } from './services/pos.service';
import { PosProductCardComponent } from './components/pos-product-card/pos-product-card.component';
import { PosCartComponent } from './components/pos-cart/pos-cart.component';
import { PosCheckoutComponent } from './components/pos-checkout/pos-checkout.component';
import { PosReceiptComponent } from './components/pos-receipt/pos-receipt.component';
import { PosHeldOrdersComponent } from './components/pos-held-orders/pos-held-orders.component';
import { PosHistoryComponent } from './components/pos-history/pos-history.component';
import { ProductSortOption, ProductStockFilter } from './models/pos.model';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PosProductCardComponent,
    PosCartComponent,
    PosCheckoutComponent,
    PosReceiptComponent,
    PosHeldOrdersComponent,
    PosHistoryComponent,
  ],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css',
})
export class PosComponent implements OnInit, OnDestroy {
  public posService = inject(PosService);

  public currentTime = signal<string>('');
  public isMobileCartOpen = signal<boolean>(false);
  private clockInterval: any;

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private updateClock(): void {
    const now = new Date();
    this.currentTime.set(
      now.toLocaleDateString('en-US', {
        month: 'long',
        day: '2-digit',
        year: 'numeric',
        weekday: 'long',
      })
    );
  }

  public onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.posService.searchQuery.set(target.value);
  }

  public clearSearch(): void {
    this.posService.searchQuery.set('');
  }

  public setCategory(category: string): void {
    this.posService.selectedCategory.set(category);
  }

  public onStockFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.posService.stockFilter.set(target.value as ProductStockFilter);
  }

  public setSort(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.posService.sortBy.set(target.value as ProductSortOption);
  }

  public openHeldOrders(): void {
    this.posService.isHeldOrdersModalOpen.set(true);
  }

  public openHistory(): void {
    this.posService.isHistoryModalOpen.set(true);
  }

  public refresh(): void {
    this.posService.refreshProducts();
  }

  public toggleMobileCart(): void {
    this.isMobileCartOpen.update((open) => !open);
  }

  public closeMobileCart(): void {
    this.isMobileCartOpen.set(false);
  }
}
