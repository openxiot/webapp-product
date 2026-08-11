import {Component, EventEmitter, Input, Output, signal} from '@angular/core';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzTooltipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {TranslatePipe} from '@ngx-translate/core';
import {UnitDefinition} from '@openxiot/xiot-core-spec-ts';
import {MainI18nService} from '../../../../../../service/i18n.service';

@Component({
  selector: 'property-definition-unit',
  templateUrl: './property.definition.unit.component.html',
  styleUrl: './property.definition.unit.component.less',
  standalone: true,
  imports: [
    NzSelectModule,
    NzTooltipModule,
    NzIconModule,
    NzTagModule,
    TranslatePipe,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PropertyDefinitionUnitComponent,
      multi: true
    }
  ]
})
export class PropertyDefinitionUnitComponent implements ControlValueAccessor {

  @Input() updatable: boolean = false;
  @Input() units: UnitDefinition[] = [];
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  // 组件内部维护的值
  private _value = signal<string>('');

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
    return this._value();
  }

  // 设置当前值，并通知外部变化
  set value(val: string) {
    if (val !== this._value()) {
      this._value.set(val);
      this.onChange(val); // 重要：通知外部表单值已变化
      this.changed.emit();
    }
    this.onTouched(); // 标记为已触摸
  }

  // --- ControlValueAccessor 接口方法 ---

  // 外部程序设置表单值（如 patchValue、setValue）时，Angular 会调用此方法
  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this._value()) {
      this._value.set(obj);
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

  protected getValueDescription(): string {
    const found = this.units.find(x => x.type.name == this._value());
    if (found) {
      return found.description.get(this.i18n.getCurrentLang()) || this._value();
    }

    return this._value();
  }
}
