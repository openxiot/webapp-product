import {Component} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'product-basic-model',
  standalone: true,
  templateUrl: './product.basic.model.component.html',
  styleUrls: ['./product.basic.model.component.less'],
  imports: [
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ProductBasicModelComponent,
      multi: true
    }
  ]
})
export class ProductBasicModelComponent implements ControlValueAccessor {
  private _value!: string;

  disabled = false;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
  }

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
    }

    this.onTouched();
  }

  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this._value) {
      this._value = obj;
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
