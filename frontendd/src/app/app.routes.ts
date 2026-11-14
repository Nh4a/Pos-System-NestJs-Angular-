import { Routes } from '@angular/router';
import { PosComponent } from './features/pos/pos.component';
import { ProductPage } from './features/products/pages/product.page/product.page';

export const routes: Routes = [
  { path: '', redirectTo: 'pos', pathMatch: 'full' },
  { path: 'pos', component: PosComponent },
  { path: 'products', component: ProductPage },
  { path: '**', redirectTo: 'pos' },
];
