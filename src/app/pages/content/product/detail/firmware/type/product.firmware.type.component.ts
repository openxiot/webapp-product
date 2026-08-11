import {Component, signal} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-firmware-type',
  standalone: true,
  templateUrl: './product.firmware.type.component.html',
  styleUrl: './product.firmware.type.component.less',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzRadioModule,
    NzTagModule,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ProductFirmwareTypeComponent,
      multi: true
    }
  ]
})
export class ProductFirmwareTypeComponent implements ControlValueAccessor {

  private _value = signal<string>('simple');

  disabled = signal(false);

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
  }

  get value(): string {
    return this._value();
  }

  set value(val: string) {
    if (val !== this._value()) {
      this._value.set(val);
      this.onChange(val);
    }

    this.onTouched();
  }

  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this._value()) {
      this._value.set(obj);
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled.set(isDisabled);
  }
}
