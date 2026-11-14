import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosService } from '../../services/pos.service';

@Component({
  selector: 'app-pos-held-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos-held-orders.component.html',
})
export class PosHeldOrdersComponent {
  public posService = inject(PosService);

  public close(): void {
    this.posService.isHeldOrdersModalOpen.set(false);
  }
}
