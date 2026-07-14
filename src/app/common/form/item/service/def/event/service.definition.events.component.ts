import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzModalService} from 'ng-zorro-antd/modal';
import {EventDefinition} from '@openxiot/xiot-core-spec-ts';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {EventDefinitionSelector} from "../../../../../dialog/definition/select/event/EventDefinitionSelector";
import {EventDefinitionSelectComponent} from "../../../../../dialog/definition/select/event/event.definition.select.component";
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../../service/i18n.service';

@Component({
  selector: 'service-definition-events',
  templateUrl: './service.definition.events.component.html',
  styleUrl: './service.definition.events.component.less',
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
      useExisting: ServiceDefinitionEventsComponent,
      multi: true
    },
    NzModalService
  ]
})
export class ServiceDefinitionEventsComponent implements ControlValueAccessor {

  @Input() updatable: boolean = true;
  @Input() events: EventDefinition[] = [];
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  // 组件内部维护的值
  private _value: EventDefinition[] = [];

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: EventDefinition[]) => void = () => {
  };
  onTouched: () => void = () => {
  };

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public i18n: MainI18nService
  ) {
  }

  // 获取当前值
  get value(): EventDefinition[] {
    return this._value;
  }

  // 设置当前值，并通知外部变化
  set value(val: EventDefinition[]) {
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

    const modal = this.modal.create<EventDefinitionSelectComponent, EventDefinitionSelector, Set<EventDefinition>>({
      nzTitle: this.i18n.translate.instant('选择属性'),
      nzContent: EventDefinitionSelectComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new EventDefinitionSelector(this.events, exclusion),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
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

  addMember(def: EventDefinition) {
    this._value.push(def);
    this.onChange(this._value);
    this.onTouched();
    this.changed.emit();
  }

  removeItem(def: EventDefinition): void {
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
