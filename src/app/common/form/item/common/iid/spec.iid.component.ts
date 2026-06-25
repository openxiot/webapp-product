import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';

export const IID_MIN = 1;
export const IID_MAX = 65535;

@Component({
  selector: 'spec-iid',
  templateUrl: './spec.iid.component.html',
  styleUrls: ['./spec.iid.component.less'],
  standalone: true,
  imports: [
    NzInputNumberModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SpecIidComponent,
      multi: true
    }
  ]
})
export class SpecIidComponent implements ControlValueAccessor {

  protected readonly IID_MIN = IID_MIN;
  protected readonly IID_MAX = IID_MAX;

  @Input() updatable: boolean = false;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  // 组件内部维护的值（自然数）
  private _value: number = 0;

  // 禁用状态
  isDisabled = false;

  // 校验错误信息
  errorTip: string = '';

  // 定义变化回调和触摸回调
  onChange: (value: number) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
  }

  // 获取当前值
  get value(): number {
    return this._value;
  }

  // 设置当前值，并通知外部变化
  set value(val: number) {
    const num = this.toNaturalNumber(val);
    if (num !== this._value) {
      this._value = num;
      this.validate(num);
      this.onChange(num);
      this.changed.emit();
    }
    this.onTouched();
  }

  // --- 校验 ---

  private validate(num: number): void {
    if (num < IID_MIN || num > IID_MAX) {
      this.errorTip = `iid 必须是 ${IID_MIN}~${IID_MAX} 之间的自然数`;
    } else {
      this.errorTip = '';
    }
  }

  /**
   * 将输入值转为自然数（>= 1 的整数）
   * 小于 1 → 1，大于 IID_MAX → IID_MAX，非整数 → 向下取整
   */
  private toNaturalNumber(val: number): number {
    if (isNaN(val) || val === null || val === undefined) {
      return 0;
    }
    const intVal = Math.floor(val);
    if (intVal < IID_MIN) return IID_MIN;
    if (intVal > IID_MAX) return IID_MAX;
    return intVal;
  }

  // --- ControlValueAccessor 接口方法 ---

  writeValue(obj: any): void {
    const num = typeof obj === 'number' ? obj : Number(obj);
    if (!isNaN(num) && num !== this._value) {
      this._value = this.toNaturalNumber(num);
      this.validate(this._value);
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
}
