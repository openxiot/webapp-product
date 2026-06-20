import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ActionDefinition} from '@openxiot/xiot-core-spec-ts';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {ActionDefinitionSelector} from "../../../../../dialog/definition/select/action/ActionDefinitionSelector";
import {ActionDefinitionSelectComponent} from "../../../../../dialog/definition/select/action/action.definition.select.component";
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'service-definition-actions',
  templateUrl: './service.definition.actions.component.html',
  styleUrls: ['./service.definition.actions.component.less'],
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    NzColDirective,
    NzRowDirective,
    TranslatePipe
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ServiceDefinitionActionsComponent,
      multi: true
    },
    NzModalService
  ]
})
export class ServiceDefinitionActionsComponent implements ControlValueAccessor {

  @Input() updatable: boolean = true;
  @Input() language: string = 'en-US';
  @Input() actions: ActionDefinition[] = [];
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  // 组件内部维护的值
  private _value: ActionDefinition[] = [];

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: ActionDefinition[]) => void = () => {
  };
  onTouched: () => void = () => {
  };

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {
  }

  // 获取当前值
  get value(): ActionDefinition[] {
    return this._value;
  }

  // 设置当前值，并通知外部变化
  set value(val: ActionDefinition[]) {
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

  addItem() {
    const exclusion = new Set(this._value.map(x => x.type.name));

    const modal = this.modal.create<ActionDefinitionSelectComponent, ActionDefinitionSelector, Set<ActionDefinition>>({
      nzTitle: '选择属性',
      nzContent: ActionDefinitionSelectComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new ActionDefinitionSelector(this.actions, exclusion, this.language),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '确认',
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this._value = [];

        const sortedResult = Array.from(result).sort((a, b) => a.type.name.localeCompare(b.type.name));
        for (let item of sortedResult) {
          this.addMember(item);
        }
      }
    });
  }

  addMember(def: ActionDefinition) {
    this._value.push(def);
    this.onChange(this._value);
    this.onTouched();
    this.changed.emit();
  }

  removeItem(def: ActionDefinition): void {
    const index = this._value.indexOf(def);
    if (index > -1) {
      this._value.splice(index, 1);
      // 通知外部值已变化
      this.onChange(this._value);
      this.onTouched();
      this.changed.emit();
    }
  }
}
