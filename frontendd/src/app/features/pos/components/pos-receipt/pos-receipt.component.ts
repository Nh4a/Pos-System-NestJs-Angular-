import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosService } from '../../services/pos.service';

@Component({
  selector: 'app-pos-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos-receipt.component.html',
})
export class PosReceiptComponent {
  public posService = inject(PosService);

  public printReceipt(): void {
    window.print();
  }

  public closeReceipt(): void {
    this.posService.closeReceipt();
  }
}
