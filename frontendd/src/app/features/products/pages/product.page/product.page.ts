import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../service/product.service';
import { ProductForm } from '../../components/product-form/product-form';
import { Loading } from '../../components/loading/loading';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, ProductForm, Loading],
  templateUrl: './product.page.html',
  styleUrl: './product.page.css',
})
export class ProductPage implements OnInit {
  constructor(protected productService: ProductService) {}

  ngOnInit() {
    this.productService.fetchProducts();
  }

  protected readonly onsubmit = onsubmit;
}
