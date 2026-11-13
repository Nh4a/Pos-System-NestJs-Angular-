import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ProductPage} from './features/products/pages/product.page/product.page'
import { ProductForm } from './features/products/components/product-form/product-form';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProductPage, ProductForm],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('crud-product');

  onsubmit(){
    alert(this.title);
  }
}
