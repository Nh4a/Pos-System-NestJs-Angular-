import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../models/product/product';
import { PosService } from '../../services/pos.service';

@Component({
  selector: 'app-pos-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos-product-card.component.html',
})
export class PosProductCardComponent {
  public posService = inject(PosService);

  public product = input.required<Product>();

  public isOutOfStock = computed(() => this.product().stockQty <= 0);
  public isLowStock = computed(() => this.product().stockQty > 0 && this.product().stockQty <= 5);

  public quantityInCart = computed(() => {
    return this.posService.cartMap().get(this.product().id) || 0;
  });

  public fallbackImage = '/img/no-image.jpg';

  public onCardClick(): void {
    if (!this.isOutOfStock()) {
      this.posService.addToCart(this.product());
    }
  }

  public onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.fallbackImage;
  }
}
