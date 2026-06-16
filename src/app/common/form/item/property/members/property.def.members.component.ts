import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzModalService} from 'ng-zorro-antd/modal';
import {PropertyDefinition} from '@openxiot/xiot-core-spec-ts';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {
  DefinitionSelectMemberComponent
} from '../../../../device/instance/dialog/definition/select/member/definition.select.member.component';
import {
  DefinitionSelectMember
} from '../../../../device/instance/dialog/definition/select/member/DefinitionSelectMember';

@Component({
  selector: 'property-def-members',
  templateUrl: './property.def.members.component.html',
  styleUrls: ['./property.def.members.component.less'],
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    NzToolTipModule,
    NzIconModule,
    NzTagModule,
    NzColDirective,
    NzRowDirective
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PropertyDefMembersComponent,
      multi: true
    },
    NzModalService
  ]
})
export class PropertyDefMembersComponent implements ControlValueAccessor {

  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  @Input() language!: string;

  // 组件内部维护的值
  private _value: PropertyDefinition[] = [];

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: PropertyDefinition[]) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {
  }

  // 获取当前值
  get value(): PropertyDefinition[] {
    return this._value;
  }

  // 设置当前值，并通知外部变化
  set value(val: PropertyDefinition[]) {
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

  addMemberItem() {
    const modal = this.modal.create<DefinitionSelectMemberComponent, DefinitionSelectMember, Set<PropertyDefinition>>({
      nzTitle: '选择属性作为成员',
      nzContent: DefinitionSelectMemberComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new DefinitionSelectMember(this._value, this.language),
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

  addMember(def: PropertyDefinition) {
    console.log('addMember: ', def.type.toString());
    this._value.push(def);
    this.changed.emit();
  }

  // 删除成员
  removeMember(def: PropertyDefinition): void {
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
