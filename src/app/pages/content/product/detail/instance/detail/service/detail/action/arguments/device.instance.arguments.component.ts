import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewContainerRef} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzTooltipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzInputNumberComponent} from 'ng-zorro-antd/input-number';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {Argument, LifeCycle, Service} from '@openxiot/xiot-core-spec-ts';
import {NzModalService} from 'ng-zorro-antd/modal';
import {SelectArgumentComponent} from '../../../../../../../../../../common/dialog/instance/select/argument/select.argument.component';
import {SelectArgument} from '../../../../../../../../../../common/dialog/instance/select/argument/SelectArgument';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../../../../../../service/i18n.service';

@Component({
  selector: 'device-instance-arguments',
  templateUrl: './device.instance.arguments.component.html',
  styleUrl: './device.instance.arguments.component.less',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzTooltipModule,
    NzIconModule,
    NzTagModule,
    NzInputNumberComponent,
    NzSpaceModule,
    NzRowDirective,
    NzColDirective,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DeviceInstanceArgumentsComponent,
      multi: true
    },
    NzModalService
  ]
})
export class DeviceInstanceArgumentsComponent implements ControlValueAccessor, OnChanges {

  protected readonly LifeCycle = LifeCycle;

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  @Input() service!: Service;

  @Input() language!: string;

  // 组件内部维护的值
  arguments: Argument[] = [];

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: Argument[]) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public i18n: MainI18nService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges: ', changes);
  }

  // --- ControlValueAccessor 接口方法 ---

  // 外部程序设置表单值（如 patchValue、setValue）时，Angular 会调用此方法
  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this.arguments) {
      this.arguments = obj;
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
    this.onChange(this.arguments);
    this.changed.emit();
  }

  protected getDescription(arg: Argument): string {
    if (this.service) {
      const p = this.service.properties.get(arg.piid);
      if (p) {
        return p.description.get(this.language) || p.description.get('en-US') || '';
      }
    }

    return '?';
  }

  protected removeArgument(arg: Argument): void {
    this.arguments = this.arguments.filter(x => x.piid !== arg.piid);
    this.onChanged();
  }

  protected addArgument(): void {
    const exclusion = new Set(this.arguments.map(x => x.piid));

    const modal = this.modal.create<SelectArgumentComponent, SelectArgument, Set<number>>({
      nzTitle: this.i18n.translate.instant('选择属性作为参数'),
      nzWidth: 1000,
      nzContent: SelectArgumentComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new SelectArgument(this.service, exclusion, this.language),
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
        this.addArguments(result);
      }
    });
  }

  private addArguments(result: Set<number>) {
    for (let iid of result) {
      this.arguments.push(new Argument(iid));
    }

    this.arguments = this.arguments.sort((a, b) => a.piid - b.piid);

    this.onChanged();
  }
}
