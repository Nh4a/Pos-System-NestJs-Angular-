import {
  Component,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ProductForm as productForm,
  ProductFormValue,
} from '../../../../models/product/create-product-form';
import { noSpaceValidator } from '../../../../shared/validators/noSpace.validator';
import { Product } from '../../../../models/product/product';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  private formBuilder = inject(FormBuilder);
  protected imagePreview: string | null = null;
  protected selectedFile: File | null = null;
  public product: InputSignal<Product | null> = input<Product | null>(null);
  protected onSubmit: OutputEmitterRef<ProductFormValue> = output<ProductFormValue>();
  protected onReset: OutputEmitterRef<void> = output<void>();

  protected productForm: FormGroup<productForm> = this.formBuilder.group<productForm>({
    productName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), noSpaceValidator()],
    }),

    unitPrice: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),

    stockQty: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),

    description: new FormControl<string | null>(null),
  });
  // protected product = input<>

  constructor() {
    effect(() => {
      const pro = this.product();
      if (pro) {
        this.productForm.patchValue(pro);
        if (pro.imageUrl) {
          this.imagePreview = pro.imageUrl;
        }
      } else {
        this.productForm.reset();
      }
    });
  }

  protected onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    this.selectedFile = input.files?.[0] ?? null;

    if (!this.selectedFile) {
      return;
    }

    if (this.selectedFile.size > 1024 * 1024 * 5) {
      alert('file is too large. ');
    }

    this.imagePreview = URL.createObjectURL(this.selectedFile);
    console.log(this.selectedFile);
  }

  protected reSetClick() {
    this.imagePreview = null;
    this.selectedFile = null;
    this.onReset.emit();
  }

  public submitClick() {
    this.onSubmit.emit({
      id: this.product()?.id,
      ...this.productForm.value,
      file: this.selectedFile || null,
    });
  }
}
