import {Component} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {Arg} from './Arg';
import {NzInputNumberComponent, NzInputNumberGroupComponent} from 'ng-zorro-antd/input-number';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

@Component({
  selector: 'editor-service-action-argument',
  templateUrl: './editor.service.action.argument.component.html',
  styleUrls: ['./editor.service.action.argument.component.less'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzToolTipModule,
    NzIconModule,
    NzTagModule,
    NzInputNumberComponent,
    NzInputNumberGroupComponent,
    NzSpaceModule,
    NzRowDirective,
    NzColDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: EditorServiceActionArgumentComponent,
      multi: true
    }
  ]
})
export class EditorServiceActionArgumentComponent implements ControlValueAccessor {

  // 组件内部维护的值
  private _value!: Arg;

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: Arg) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
  ) {
  }

  // 获取当前值
  get value(): Arg {
    return this._value;
  }

  // 设置当前值，并通知外部变化
  set value(val: Arg) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val); // 重要：通知外部表单值已变化
    }
    this.onTouched(); // 标记为已触摸
  }

  // --- ControlValueAccessor 接口方法 ---

  // 外部程序设置表单值（如 patchValue、setValue）时，Angular 会调用此方法
  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this._value) {
      this._value = obj;
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

  onChanged() {

  }
}
