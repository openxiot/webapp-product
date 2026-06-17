import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {FormatDefinition, LifeCycle} from "@openxiot/xiot-core-spec-ts";
import {NzSelectModule} from 'ng-zorro-antd/select';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'format-code',
  templateUrl: './format.code.component.html',
  styleUrls: ['./format.code.component.less'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzToolTipModule,
    NzIconModule,
    NzTagModule,
    NzSelectModule,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FormatCodeComponent,
      multi: true
    }
  ]
})
export class FormatCodeComponent implements ControlValueAccessor, OnChanges {

  @Input() updatable: boolean = true;
  @Input() formats: FormatDefinition[] = [];
  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  // 组件内部维护的值
  private _value!: string;

  // 禁用状态
  isDisabled = false;

  protected formatSet: Set<string> = new Set();

  // 定义变化回调和触摸回调
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formats']) {
      this.formatSet = new Set(this.formats.map(x => x.type.name))
      console.log('this.formatSet: ', this.formatSet);
    }
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
      this.changed.emit();
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
}
