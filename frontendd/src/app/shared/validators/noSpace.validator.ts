import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
// import { ValidationError } from '@angular/forms/signals';

export const noSpaceValidator =():ValidatorFn=>{
  return (control: AbstractControl): ValidationErrors|null => {
    const value = String(control.value)

    return value.trim().length === 0 ? {WhiteSpace:true} : null;
  };
}
