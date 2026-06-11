import {Component, Input} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {LifeCycle} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'product-basic-name',
  standalone: true,
  templateUrl: './product.basic.name.component.html',
  styleUrls: ['./product.basic.name.component.less'],
  imports: [
    FormsModule,
    NzInputDirective,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ProductBasicNameComponent,
      multi: true
    }
  ]
})
export class ProductBasicNameComponent implements ControlValueAccessor {

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;

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

  protected readonly LifeCycle = LifeCycle;
}
