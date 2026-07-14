import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzTooltipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {LifeCycle} from "@openxiot/xiot-core-spec-ts";
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'device-instance-description',
  templateUrl: './device.instance.description.component.html',
  styleUrl: './device.instance.description.component.less',
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    NzTooltipModule,
    NzIconModule,
    NzTagModule,
    FormsModule,
    ReactiveFormsModule,
    NzRowDirective,
    NzColDirective,
    TranslatePipe
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DeviceInstanceDescriptionComponent,
      multi: true
    }
  ]
})
export class DeviceInstanceDescriptionComponent implements ControlValueAccessor {

  protected readonly LifeCycle = LifeCycle;

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: Map<string, string>) => void = () => {};
  onTouched: () => void = () => {};

  descriptionZhCN: string = '';
  descriptionZhTW: string = '';
  descriptionEnUS: string = '';

  constructor(
  ) {
  }

  // 同样为其他语言定义 getter/setter
  // --- ControlValueAccessor 接口方法 ---

  // 外部程序设置表单值（如 patchValue、setValue）时，Angular 会调用此方法
  writeValue(obj: Map<string, string>): void {
    if (obj !== undefined && obj !== null) {
      this.descriptionZhCN = obj.get('zh-CN') || '';
      this.descriptionZhTW = obj.get('zh-TW') || '';
      this.descriptionEnUS = obj.get('en-US') || '';
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
    this.isDisabled = isDisabled;
  }

  protected onDescriptionChanged(value: string): void {
    const description: Map<string, string> = new Map();
    description.set('zh-CN', this.descriptionZhCN);
    description.set('zh-TW', this.descriptionZhTW);
    description.set('en-US', this.descriptionEnUS);
    this.onChange(description);
    this.changed.emit();
  }
}
