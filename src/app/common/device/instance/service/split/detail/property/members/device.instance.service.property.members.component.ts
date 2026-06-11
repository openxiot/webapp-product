import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzModalService} from 'ng-zorro-antd/modal';
import {SelectMemberComponent} from '../../../../../dialog/select/member/select.member.component';
import {SelectMember} from '../../../../../dialog/select/member/SelectMember';
import {LifeCycle, Property, Service} from '@openxiot/xiot-core-spec-ts';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

@Component({
  selector: 'device-instance-service-property-members',
  templateUrl: './device.instance.service.property.members.component.html',
  styleUrls: ['./device.instance.service.property.members.component.less'],
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
      useExisting: DeviceInstanceServicePropertyMembersComponent,
      multi: true
    },
    NzModalService
  ]
})
export class DeviceInstanceServicePropertyMembersComponent implements ControlValueAccessor {

  protected readonly LifeCycle = LifeCycle;

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  @Input() service!: Service;

  @Input() property!: Property;

  @Input() language!: string;

  // 组件内部维护的值
  private _value: number[] = [];

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: number[]) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {
  }

  // 获取当前值
  get value(): number[] {
    return this._value;
  }

  // 设置当前值，并通知外部变化
  set value(val: number[]) {
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
    const modal = this.modal.create<SelectMemberComponent, SelectMember, Set<number>>({
      nzTitle: '选择属性作为成员',
      nzContent: SelectMemberComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new SelectMember(this.service, this.property, this.language),
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

        const sortedResult = Array.from(result).sort((a, b) => a - b);
        for (let iid of sortedResult) {
          const p = this.service.properties.get(iid);
          if (p) {
            this.addMember(p);
          }
        }
      }
    });
  }

  addMember(property: Property) {
    console.log('addMember: ', property.iid);
    this._value.push(property.iid);
    this.changed.emit();
  }

  // 根据属性ID获取属性名称
  getPropertyName(iid: number): string {
    const property = this.service.properties.get(iid);
    if (!property) {
      return `未知属性 (${iid})`;
    }

    return property.description.get(this.language) || '?';
  }

  // 删除成员
  removeMember(iid: number): void {
    const index = this._value.indexOf(iid);
    if (index > -1) {
      this._value.splice(index, 1);
      // 通知外部值已变化
      this.onChange(this._value);
      this.onTouched();
      this.changed.emit();
    }
  }
}
