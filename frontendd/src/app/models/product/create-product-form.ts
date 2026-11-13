import { FormControl } from '@angular/forms';

export interface ProductForm {
  id?: FormControl<number | null>;
  productName: FormControl<string>;
  unitPrice: FormControl<number>;
  stockQty: FormControl<number>;
  description?: FormControl<string | null>;
}

export interface ProductFormValue {
  id?: number | null;
  productName?: string;
  unitPrice?: number;
  stockQty?: number;
  description?: string | null;
  file: File | null;
}
