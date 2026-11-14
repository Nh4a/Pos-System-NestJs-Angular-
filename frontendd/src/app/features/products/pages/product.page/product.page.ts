import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { ProductForm } from '../../components/product-form/product-form';
import { Loading } from '../../components/loading/loading';
import { Product } from '../../../../models/product/product';
import { ProductFormValue } from '../../../../models/product/create-product-form';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductForm, Loading],
  templateUrl: './product.page.html',
  styleUrl: './product.page.css',
})
export class ProductPage implements OnInit {
  // Filter & Search Signals
  public searchQuery = signal<string>('');
  public selectedCategory = signal<string>('all');
  public stockFilter = signal<string>('all');
  public sortBy = signal<string>('name');
  public viewMode = signal<'table' | 'cards'>('table');

  // Form Dialog Modal
  public isFormModalOpen = signal<boolean>(false);

  constructor(public productService: ProductService) {}

  ngOnInit() {
    this.productService.fetchProducts();
  }

  // Category classifier
  public getProductCategory(product: Product): 'Foods' | 'Beverages' | 'Others' {
    const text = `${product.productName} ${product.description || ''}`.toLowerCase();
    if (/drink|beverage|coffee|tea|shake|milkshake|juice|water|coke|soda|smoothie|beer|wine|latte|espresso/.test(text)) {
      return 'Beverages';
    }
    if (/burger|cheeseburger|salad|fries|food|meal|pizza|sandwich|pasta|chicken|beef|steak|soup|noodle|cake|dessert|bread|combo|snack|taco/.test(text)) {
      return 'Foods';
    }
    return 'Others';
  }

  // Quick Stats KPI
  public totalProductsCount = computed(() => this.productService.products().length);
  public lowStockCount = computed(
    () => this.productService.products().filter((p) => p.stockQty > 0 && p.stockQty <= 5).length
  );
  public outOfStockCount = computed(
    () => this.productService.products().filter((p) => p.stockQty === 0).length
  );
  public foodsCount = computed(
    () => this.productService.products().filter((p) => this.getProductCategory(p) === 'Foods').length
  );
  public beveragesCount = computed(
    () => this.productService.products().filter((p) => this.getProductCategory(p) === 'Beverages').length
  );
  public othersCount = computed(
    () => this.productService.products().filter((p) => this.getProductCategory(p) === 'Others').length
  );

  // Filtered and Sorted Catalog
  public filteredProducts = computed(() => {
    let prods = [...this.productService.products()];
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory().toLowerCase();

    // 1. Category Filter
    if (cat !== 'all') {
      prods = prods.filter((p) => this.getProductCategory(p).toLowerCase() === cat);
    }

    // 2. Search Text
    if (query) {
      prods = prods.filter(
        (p) =>
          p.productName.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          p.id.toString() === query
      );
    }

    // 3. Stock Level Filter
    const stock = this.stockFilter();
    if (stock === 'in-stock') {
      prods = prods.filter((p) => p.stockQty > 5);
    } else if (stock === 'low-stock') {
      prods = prods.filter((p) => p.stockQty > 0 && p.stockQty <= 5);
    } else if (stock === 'out-of-stock') {
      prods = prods.filter((p) => p.stockQty === 0);
    }

    // 4. Sorting
    const sort = this.sortBy();
    prods.sort((a, b) => {
      switch (sort) {
        case 'price-high':
          return b.unitPrice - a.unitPrice;
        case 'price-low':
          return a.unitPrice - b.unitPrice;
        case 'stock-high':
          return b.stockQty - a.stockQty;
        case 'stock-low':
          return a.stockQty - b.stockQty;
        case 'name':
        default:
          return a.productName.localeCompare(b.productName);
      }
    });

    return prods;
  });

  // Modal Handlers
  public openCreate(): void {
    this.productService.onResetForm();
    this.isFormModalOpen.set(true);
  }

  public openEdit(item: Product): void {
    this.productService.setUpdateProductToForm(item);
    this.isFormModalOpen.set(true);
  }

  public closeModal(): void {
    this.isFormModalOpen.set(false);
    this.productService.onResetForm();
  }

  public handleFormSubmit(event: ProductFormValue): void {
    this.productService.onSubmit(event);
    this.isFormModalOpen.set(false);
  }

  // Filter actions
  public onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  public setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  public onStockFilterChange(event: Event): void {
    this.stockFilter.set((event.target as HTMLSelectElement).value);
  }

  public onSortChange(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value);
  }

  public resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.stockFilter.set('all');
    this.sortBy.set('name');
  }

  public setViewMode(mode: 'table' | 'cards'): void {
    this.viewMode.set(mode);
  }
}
