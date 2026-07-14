import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzTooltipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {DataFormat, LifeCycle} from "@openxiot/xiot-core-spec-ts";
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'device-instance-service-property-format',
  templateUrl: './device.instance.service.property.format.component.html',
  styleUrl: './device.instance.service.property.format.component.less',
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    NzTooltipModule,
    NzIconModule,
    NzTagModule,
    FormsModule,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzSpaceModule,
    NzTagModule,
    NzOptionComponent,
    NzSelectComponent,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DeviceInstanceServicePropertyFormatComponent,
      multi: true
    }
  ],
})
export class DeviceInstanceServicePropertyFormatComponent implements ControlValueAccessor {

  protected readonly LifeCycle = LifeCycle;

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

// 使用 readonly 确保 formats 不会被修改
  readonly formats: Array<{ value: DataFormat, label: string }> = [
    { value: DataFormat.BOOL, label: '布尔值' },
    { value: DataFormat.UINT8, label: '无符号8位整型' },
    { value: DataFormat.UINT16, label: '无符号16位整型' },
    { value: DataFormat.UINT32, label: '无符号32位整型' },
    { value: DataFormat.INT8, label: '8位整型' },
    { value: DataFormat.INT16, label: '16位整型' },
    { value: DataFormat.INT32, label: '32位整型' },
    { value: DataFormat.INT64, label: '64位整型' },
    { value: DataFormat.FLOAT, label: '浮点数' },
    { value: DataFormat.STRING, label: '字符串' },
    { value: DataFormat.HEX, label: '16进制字符串' },
    { value: DataFormat.TLV8, label: 'TLV8字符串' },
    { value: DataFormat.COMBINATION, label: '组合值' },
  ];

  // 组件内部维护的值
  _value: DataFormat = DataFormat.BOOL;

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: DataFormat) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
  ) {
  }

  // 获取当前值
  get value(): DataFormat {
    return this._value;
  }

  // 设置当前值，并通知外部变化
  set value(val: DataFormat) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val); // 重要：通知外部表单值已变化
    }
    this.onTouched(); // 标记为已触摸
  }

  // 获取当前选中项的显示标签
  get selectedLabel(): string {
    const selected = this.formats.find(item => item.value === this._value);
    return selected ? selected.label : '未知格式';
  }

  // 选择变化处理
  onSelectionChange(value: DataFormat): void {
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
  writeValue(value: DataFormat): void {
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
