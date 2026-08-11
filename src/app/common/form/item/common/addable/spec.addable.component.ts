import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {TranslatePipe} from '@ngx-translate/core';
import {NzRadioComponent, NzRadioGroupComponent} from 'ng-zorro-antd/radio';
import {LifeCycle} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'spec-addable',
  templateUrl: './spec.addable.component.html',
  styleUrl: './spec.addable.component.less',
  standalone: true,
  imports: [
    NzSwitchModule,
    FormsModule,
    NzTagModule,
    TranslatePipe,
    NzRadioComponent,
    NzRadioGroupComponent
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SpecAddableComponent,
      multi: true
    }
  ]
})
export class SpecAddableComponent implements ControlValueAccessor {

  @Input() updatable: boolean = false;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  // 组件内部维护的布尔值
  private _value = signal(false);

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
  }

  // 获取当前值
  get value(): boolean {
    return this._value();
  }

  // 设置当前值，并通知外部变化
  set value(val: boolean) {
    if (val !== this._value()) {
      this._value.set(val);
      this.onChange(val);
      this.changed.emit();
    }
    this.onTouched();
  }

  // --- ControlValueAccessor 接口方法 ---

  writeValue(obj: any): void {
    const boolVal = !!obj;
    if (boolVal !== this._value()) {
      this._value.set(boolVal);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  protected readonly LifeCycle = LifeCycle;
}
