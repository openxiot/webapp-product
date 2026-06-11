import {Component, Input} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {UpgradeType} from './UpgradeType';
import {LifeCycle} from '@openxiot/xiot-core-spec-ts';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzTagComponent, NzTagModule} from 'ng-zorro-antd/tag';

@Component({
  selector: 'product-basic-upgrade',
  standalone: true,
  templateUrl: './product.basic.upgrade.component.html',
  styleUrls: ['./product.basic.upgrade.component.less'],
  imports: [
    FormsModule,
    NzSpaceModule,
    NzCheckboxModule,
    NzTagModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ProductBasicUpgradeComponent,
      multi: true
    }
  ]
})
export class ProductBasicUpgradeComponent implements ControlValueAccessor {

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;

  private _value: UpgradeType = new UpgradeType();

  disabled = false;

  onChange: (value: UpgradeType) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
  }

  get value(): UpgradeType {
    return this._value;
  }

  set value(val: UpgradeType) {
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

  // 通知表单值已变化
  notifyChange() {
    // 调用 onChange 通知表单最新值
    this.onChange(this.value);
    // 调用 onTouched 标记控件为已触碰（用于表单验证状态）
    this.onTouched();
  }

  protected readonly LifeCycle = LifeCycle;
}
