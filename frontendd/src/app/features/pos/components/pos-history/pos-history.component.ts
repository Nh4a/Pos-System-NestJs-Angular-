import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosService } from '../../services/pos.service';
import { POSOrder } from '../../models/pos.model';

@Component({
  selector: 'app-pos-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos-history.component.html',
})
export class PosHistoryComponent {
  public posService = inject(PosService);

  public totalSales = computed(() => {
    return this.posService.orderHistory().reduce((sum, ord) => sum + ord.total, 0);
  });

  public close(): void {
    this.posService.isHistoryModalOpen.set(false);
  }

  public reprint(order: POSOrder): void {
    this.posService.reprintReceipt(order);
  }
}
