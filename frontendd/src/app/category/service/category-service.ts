import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  public categories = signal<Category[]>([]);
  private readonly APIURL = 'http://localhost:3000/api/category';

  constructor(private http: HttpClient) {}

  public fetchCategory() {
    this.http.get<Category[]>(this.APIURL).subscribe({
      next: response => {
        this.categories.set(response);
        console.log(this.categories());
      }
    })
  }
}
