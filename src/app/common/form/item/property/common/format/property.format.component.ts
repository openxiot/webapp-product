import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ControlValueAccessor, FormBuilder, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {FormatDefinition} from '@openxiot/xiot-core-spec-ts';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../../service/i18n.service';

@Component({
  selector: 'property-format',
  templateUrl: './property.format.component.html',
  styleUrls: ['./property.format.component.less'],
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    NzToolTipModule,
    NzIconModule,
    NzTagModule,
    FormsModule,
    ReactiveFormsModule,
    NzSelectModule,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PropertyFormatComponent,
      multi: true
    }
  ]
})
export class PropertyFormatComponent implements ControlValueAccessor {

  @Input() formats: FormatDefinition[] = [];
  @Input() updatable: boolean = false;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  // 组件内部维护的值
  _value: string = 'bool';

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    public i18n: MainI18nService
  ) {
  }

  // 获取当前值
  get value(): string {
    return this._value;
  }

  // 设置当前值，并通知外部变化
  set value(val: string) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val); // 重要：通知外部表单值已变化
    }
    this.onTouched(); // 标记为已触摸
  }

  // 获取当前选中项的显示标签
  get selectedLabel(): string {
    const selected = this.formats.find(item => item.type.name === this._value);
    return selected ? (selected.description.get(this.i18n.getCurrentLang()) || selected.type.name) : 'unknown';
  }

  // 选择变化处理
  onSelectionChange(value: string): void {
    console.log('onSelectionChange: ', value);

    if (this.isDisabled) {
      return;
    }

    // 检查值是否真正发生变化
    if (value !== this._value) {
      this._value = value;

      // 通知外部表单值已变化
      this.onChange(value);

      // 标记为已触摸
      this.onTouched();

      this.changed.emit();
    }
  }

  // --- ControlValueAccessor 接口方法 ---

  // 外部程序设置表单值（如 patchValue、setValue）时，Angular 会调用此方法
  writeValue(value: string): void {
    this._value = value;
  }

  // 注册变化回调：Angular 提供给你一个函数，当内部值变化时，你需要调用它来通知外部
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // 注册触摸回调：Angular 提供给你一个函数，当组件被触摸（如blur）时，你需要调用它
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // 当表单控件的禁用状态变更时（如调用 control.disable()），Angular 会调用此方法
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
