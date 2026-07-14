import {Component, EventEmitter, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {Property} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'create-service-properties',
  templateUrl: './create.service.properties.component.html',
  styleUrl: './create.service.properties.component.less',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzSpaceModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CreateServicePropertiesComponent,
      multi: true
    }
  ]
})
export class CreateServicePropertiesComponent implements ControlValueAccessor, OnChanges {

  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  properties: Property[] = [];
  disabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: Property[]) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges: ', changes);
  }

  // --- ControlValueAccessor 接口方法 ---

  // 外部程序设置表单值（如 patchValue、setValue）时，Angular 会调用此方法
  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this.properties) {
      this.properties = obj;
    }
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
    this.disabled = isDisabled;
  }

  onChanged() {
    this.onChange(this.properties);
    this.changed.emit();
  }

  protected onTagCheckedChange(property: Property, checked: boolean) {
    // 更新选中状态
    property.type._checked = checked;

    // 通知表单值变化（触发 ControlValueAccessor 的 onChange）
    this.onChanged();

    // 标记组件已被触摸（符合表单控件规范）
    this.onTouched();
  }
}
