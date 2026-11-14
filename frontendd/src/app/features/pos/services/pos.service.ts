import { Injectable, computed, inject, signal } from '@angular/core';
import { Product } from '../../../models/product/product';
import { ProductService } from '../../products/service/product.service';
import {
  CartItem,
  HeldOrder,
  PaymentMethod,
  POSOrder,
  ProductSortOption,
  ProductStockFilter,
} from '../models/pos.model';

const LOCAL_STORAGE_ORDERS_KEY = 'quickpos_order_history_v1';
const LOCAL_STORAGE_HELD_KEY = 'quickpos_held_orders_v1';

@Injectable({
  providedIn: 'root',
})
export class PosService {
  private productService = inject(ProductService);

  // Re-expose the products signal from ProductService (which fetches from backend API /api/product)
  public products = this.productService.products;
  public isLoadingProducts = this.productService.isLoading;

  // Cart state
  public cart = signal<CartItem[]>([]);

  // Search & Filter state
  public searchQuery = signal<string>('');
  public stockFilter = signal<ProductStockFilter>('all');
  public sortBy = signal<ProductSortOption>('name');

  // Pricing configuration
  public taxRate = signal<number>(0); // 0, 5, 8, 10 (%)
  public discountRate = signal<number>(0); // 0, 5, 10, 15 (%)

  // Orders state
  public heldOrders = signal<HeldOrder[]>([]);
  public orderHistory = signal<POSOrder[]>([]);
  public activeReceipt = signal<POSOrder | null>(null);

  // Modal UI state
  public isCheckoutModalOpen = signal<boolean>(false);
  public isReceiptModalOpen = signal<boolean>(false);
  public isHeldOrdersModalOpen = signal<boolean>(false);
  public isHistoryModalOpen = signal<boolean>(false);

  // Toast feedback
  public toast = signal<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);
  private toastTimer: any = null;

  constructor() {
    this.loadFromStorage();
    // Fetch products from existing API on service start
    this.productService.fetchProducts();
  }

  // Quick lookup for cart item quantities by product id
  public cartMap = computed(() => {
    const map = new Map<number, number>();
    for (const item of this.cart()) {
      map.set(item.product.id, item.quantity);
    }
    return map;
  });

  // Total quantity of items in cart
  public cartItemCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  // Subtotal before tax and discount
  public subtotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.subtotal, 0);
  });

  // Calculated tax amount
  public taxAmount = computed(() => {
    return (this.subtotal() * this.taxRate()) / 100;
  });

  // Calculated discount amount
  public discountAmount = computed(() => {
    return (this.subtotal() * this.discountRate()) / 100;
  });

  // Final total payable
  public total = computed(() => {
    const totalCalc = this.subtotal() + this.taxAmount() - this.discountAmount();
    return Math.max(0, Math.round(totalCalc * 100) / 100);
  });

  // Filtered and sorted product catalog
  public filteredProducts = computed(() => {
    let prods = [...this.products()];
    const query = this.searchQuery().trim().toLowerCase();

    // 1. Text filter
    if (query) {
      prods = prods.filter(
        (p) =>
          p.productName.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          p.id.toString() === query
      );
    }

    // 2. Stock filter
    const filter = this.stockFilter();
    if (filter === 'in-stock') {
      prods = prods.filter((p) => p.stockQty > 5);
    } else if (filter === 'low-stock') {
      prods = prods.filter((p) => p.stockQty > 0 && p.stockQty <= 5);
    } else if (filter === 'out-of-stock') {
      prods = prods.filter((p) => p.stockQty === 0);
    }

    // 3. Sorting
    const sort = this.sortBy();
    prods.sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.unitPrice - b.unitPrice;
        case 'price-desc':
          return b.unitPrice - a.unitPrice;
        case 'stock':
          return b.stockQty - a.stockQty;
        case 'name':
        default:
          return a.productName.localeCompare(b.productName);
      }
    });

    return prods;
  });

  // Stock counts for badges
  public stockMetrics = computed(() => {
    const prods = this.products();
    return {
      all: prods.length,
      inStock: prods.filter((p) => p.stockQty > 5).length,
      lowStock: prods.filter((p) => p.stockQty > 0 && p.stockQty <= 5).length,
      outOfStock: prods.filter((p) => p.stockQty === 0).length,
    };
  });

  /* ---------------- Cart Management ---------------- */

  public addToCart(product: Product): boolean {
    if (product.stockQty <= 0) {
      this.showToast(`"${product.productName}" is out of stock!`, 'warning');
      return false;
    }

    const currentQtyInCart = this.cartMap().get(product.id) || 0;
    if (currentQtyInCart >= product.stockQty) {
      this.showToast(
        `Cannot add more. Only ${product.stockQty} unit(s) available for "${product.productName}".`,
        'warning'
      );
      return false;
    }

    this.cart.update((items) => {
      const index = items.findIndex((i) => i.product.id === product.id);
      if (index > -1) {
        const updated = [...items];
        const newQty = updated[index].quantity + 1;
        updated[index] = {
          ...updated[index],
          quantity: newQty,
          subtotal: Math.round(newQty * product.unitPrice * 100) / 100,
        };
        return updated;
      } else {
        return [
          ...items,
          {
            product,
            quantity: 1,
            subtotal: Number(product.unitPrice),
          },
        ];
      }
    });

    this.showToast(`Added "${product.productName}" to order.`, 'success');
    return true;
  }

  public decrementQuantity(productId: number): void {
    this.cart.update((items) => {
      const index = items.findIndex((i) => i.product.id === productId);
      if (index === -1) return items;

      const item = items[index];
      if (item.quantity <= 1) {
        return items.filter((i) => i.product.id !== productId);
      }

      const updated = [...items];
      const newQty = item.quantity - 1;
      updated[index] = {
        ...item,
        quantity: newQty,
        subtotal: Math.round(newQty * item.product.unitPrice * 100) / 100,
      };
      return updated;
    });
  }

  public updateQuantity(productId: number, newQty: number): void {
    if (newQty <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const product = this.products().find((p) => p.id === productId);
    if (!product) return;

    if (newQty > product.stockQty) {
      this.showToast(`Only ${product.stockQty} in stock for "${product.productName}".`, 'warning');
      newQty = product.stockQty;
    }

    this.cart.update((items) => {
      return items.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity: newQty,
            subtotal: Math.round(newQty * item.product.unitPrice * 100) / 100,
          };
        }
        return item;
      });
    });
  }

  public removeFromCart(productId: number): void {
    const item = this.cart().find((i) => i.product.id === productId);
    this.cart.update((items) => items.filter((i) => i.product.id !== productId));
    if (item) {
      this.showToast(`Removed "${item.product.productName}" from order.`, 'info');
    }
  }

  public clearCart(): void {
    if (this.cart().length === 0) return;
    this.cart.set([]);
    this.showToast('Order cart cleared.', 'info');
  }

  /* ---------------- Held Orders ---------------- */

  public holdCurrentOrder(label?: string): boolean {
    if (this.cart().length === 0) {
      this.showToast('Cart is empty. Nothing to put on hold.', 'warning');
      return false;
    }

    const customLabel = label?.trim() || `Order #${this.heldOrders().length + 1}`;
    const newHeld: HeldOrder = {
      id: `HELD-${Date.now()}`,
      label: customLabel,
      items: [...this.cart()],
      total: this.total(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.heldOrders.update((list) => [newHeld, ...list]);
    this.cart.set([]);
    this.saveToStorage();
    this.showToast(`Order "${newHeld.label}" put on hold.`, 'info');
    return true;
  }

  public recallHeldOrder(heldId: string): void {
    const held = this.heldOrders().find((h) => h.id === heldId);
    if (!held) return;

    // Replace current cart with held order
    this.cart.set([...held.items]);
    this.heldOrders.update((list) => list.filter((h) => h.id !== heldId));
    this.saveToStorage();
    this.isHeldOrdersModalOpen.set(false);
    this.showToast(`Restored "${held.label}" into active order.`, 'success');
  }

  public deleteHeldOrder(heldId: string): void {
    this.heldOrders.update((list) => list.filter((h) => h.id !== heldId));
    this.saveToStorage();
    this.showToast('Held order deleted.', 'info');
  }

  /* ---------------- Checkout & Sale Processing ---------------- */

  public openCheckout(): void {
    if (this.cart().length === 0) {
      this.showToast('Cart is empty! Add products before checkout.', 'warning');
      return;
    }
    this.isCheckoutModalOpen.set(true);
  }

  public closeCheckout(): void {
    this.isCheckoutModalOpen.set(false);
  }

  public completeSale(
    paymentMethod: PaymentMethod,
    amountReceived?: number
  ): POSOrder | null {
    if (this.cart().length === 0) return null;

    const totalDue = this.total();
    const finalReceived = paymentMethod === 'cash' ? (amountReceived ?? totalDue) : totalDue;

    if (paymentMethod === 'cash' && finalReceived < totalDue) {
      this.showToast('Amount received is less than total due!', 'warning');
      return null;
    }

    const change = paymentMethod === 'cash' ? Math.max(0, finalReceived - totalDue) : 0;
    const now = new Date();
    const receiptNum = `POS-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order: POSOrder = {
      orderId: `ORD-${Date.now()}`,
      receiptNumber: receiptNum,
      items: [...this.cart()],
      itemCount: this.cartItemCount(),
      subtotal: this.subtotal(),
      tax: this.taxAmount(),
      taxRate: this.taxRate(),
      discount: this.discountAmount(),
      discountRate: this.discountRate(),
      total: totalDue,
      paymentMethod,
      amountReceived: finalReceived,
      change: Math.round(change * 100) / 100,
      createdAt: now.toISOString(),
      cashierName: 'Cashier #1',
    };

    // 1. Deduct stock using the old API data service
    const soldItems = order.items.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
    }));
    this.productService.deductStock(soldItems);

    // 2. Save order to history
    this.orderHistory.update((list) => [order, ...list]);
    this.saveToStorage();

    // 3. Clear cart and open receipt preview
    this.activeReceipt.set(order);
    this.cart.set([]);
    this.isCheckoutModalOpen.set(false);
    this.isReceiptModalOpen.set(true);

    this.showToast('Sale completed successfully! Receipt ready.', 'success');
    return order;
  }

  public reprintReceipt(order: POSOrder): void {
    this.activeReceipt.set(order);
    this.isReceiptModalOpen.set(true);
  }

  public closeReceipt(): void {
    this.isReceiptModalOpen.set(false);
  }

  public refreshProducts(): void {
    this.productService.fetchProducts();
    this.showToast('Product catalog refreshed from API.', 'info');
  }

  /* ---------------- Feedback Toast ---------------- */

  public showToast(message: string, type: 'success' | 'warning' | 'info' = 'info'): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toast.set({ message, type });
    this.toastTimer = setTimeout(() => {
      this.toast.set(null);
    }, 2800);
  }

  /* ---------------- Local Storage Persistence ---------------- */

  private saveToStorage(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(this.orderHistory()));
      localStorage.setItem(LOCAL_STORAGE_HELD_KEY, JSON.stringify(this.heldOrders()));
    } catch (e) {
      console.warn('Could not persist POS data to localStorage:', e);
    }
  }

  private loadFromStorage(): void {
    try {
      const savedOrders = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (savedOrders) {
        this.orderHistory.set(JSON.parse(savedOrders));
      }
      const savedHeld = localStorage.getItem(LOCAL_STORAGE_HELD_KEY);
      if (savedHeld) {
        this.heldOrders.set(JSON.parse(savedHeld));
      }
    } catch (e) {
      console.warn('Could not load POS data from localStorage:', e);
    }
  }
}
