import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzTooltipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {Access, LifeCycle, Service} from "@openxiot/xiot-core-spec-ts";
import {NzCheckboxComponent, NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'device-instance-service-property-access',
  templateUrl: './device.instance.service.property.access.component.html',
  styleUrl: './device.instance.service.property.access.component.less',
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
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DeviceInstanceServicePropertyAccessComponent,
      multi: true
    }
  ]
})
export class DeviceInstanceServicePropertyAccessComponent implements ControlValueAccessor {

  protected readonly LifeCycle = LifeCycle;

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  // 组件内部维护的值
  _value = signal<Access>(new Access());

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: Access) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
  }

  // 获取当前值
  get value(): Access {
    return this._value();
  }

  // 设置当前值，并通知外部变化
  set value(val: Access) {
    if (val !== this._value()) {
      this._value.set(val);
      this.onChange(val); // 重要：通知外部表单值已变化
    }
    this.onTouched(); // 标记为已触摸
  }

  protected onReadableChanged(value: boolean) {
    this._value.update(v => Access.of(v.isReadable, v.isWritable, v.isNotifiable));
    this.onChange(this._value());
    this.onTouched();
    this.changed.emit();
  }

  protected onWritableChanged(value: boolean) {
    this._value.update(v => Access.of(v.isReadable, v.isWritable, v.isNotifiable));
    this.onChange(this._value());
    this.onTouched();
    this.changed.emit();
  }

  protected onNotifiableChanged(value: boolean) {
    this._value.update(v => Access.of(v.isReadable, v.isWritable, v.isNotifiable));
    this.onChange(this._value());
    this.onTouched();
    this.changed.emit();
  }

  // --- ControlValueAccessor 接口方法 ---

  // 外部程序设置表单值（如 patchValue、setValue）时，Angular 会调用此方法
  writeValue(value: Access): void {
    this._value.set(value);
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
