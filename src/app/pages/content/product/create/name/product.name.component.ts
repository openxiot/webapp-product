import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {LocalizedName} from '@openxiot/xiot-core-spec-ts';
import {MainI18nService} from '../../../../../service/i18n.service';

@Component({
  selector: 'product-name',
  standalone: true,
  templateUrl: './product.name.component.html',
  styleUrls: ['./product.name.component.less'],
  imports: [
    FormsModule,
    NzInputDirective,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ProductNameComponent,
      multi: true
    }
  ]
})
export class ProductNameComponent implements ControlValueAccessor {

  @Input() updatable: boolean = false;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  private _value!: LocalizedName;

  disabled = false;

  onChange: (value: LocalizedName) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    public i18n: MainI18nService
  ) {
  }

  get value(): LocalizedName {
    return this._value;
  }

  set value(val: LocalizedName) {
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

  protected onValueChanged(newValue: string) {
    this._value.value.set(this.i18n.getCurrentLang(), newValue);
    this.onChange(this._value);
    this.onTouched();
    this.changed.emit();
  }
}
