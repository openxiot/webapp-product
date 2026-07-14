import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {LocalizedName} from '@openxiot/xiot-core-spec-ts';
import {MainI18nService} from '../../../../../service/i18n.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-alias',
  standalone: true,
  templateUrl: './product.alias.component.html',
  styleUrl: './product.alias.component.less',
  imports: [
    FormsModule,
    NzInputDirective,
    ReactiveFormsModule,
    NzRowDirective,
    NzColDirective,
    NzButtonComponent,
    NzIconDirective,
    NzWaveDirective,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ProductAliasComponent,
      multi: true
    }
  ]
})
export class ProductAliasComponent implements ControlValueAccessor {

  @Input() updatable: boolean = false;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  private _value: LocalizedName[] = [];

  disabled = false;

  onChange: (value: LocalizedName[]) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    public i18n: MainI18nService
  ) {
  }

  get value(): LocalizedName[] {
    return this._value;
  }

  set value(val: LocalizedName[]) {
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

  /**
   * 更新某个别名中当前语言的文本
   */
  protected onValueChanged(newValue: string, item: LocalizedName) {
    item.value.set(this.i18n.getCurrentLang(), newValue);
    this.onChange(this._value);
    this.onTouched();
  }

  /**
   * 删除某个别名
   */
  protected removeItem(item: LocalizedName) {
    this._value = this._value.filter(i => i !== item);
    this.onChange(this._value);
    this.onTouched();
  }

  /**
   * 新增一个别名（默认为当前语言填充空字符串）
   */
  protected addItem() {
    const map = new Map<string, string>();
    map.set(this.i18n.getCurrentLang(), '');
    const newItem = new LocalizedName(map);
    this._value = [...this._value, newItem];
    this.onChange(this._value);
    this.onTouched();
  }
}
