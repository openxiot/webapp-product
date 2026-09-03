import {
  Component,
  computed,
  effect,
  EventEmitter,
  input,
  Output,
  ViewContainerRef,
} from '@angular/core';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';

import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {Service, Event, Argument, LifeCycle} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ConfirmComponent} from '../../../../../../../../../common/dialog/confirm/confirm.component';
import {MainI18nService} from '../../../../../../../../../service/i18n.service';
import {DeviceInstanceIdComponent} from '../property/iid/device.instance.id.component';
import {DeviceInstanceNameComponent} from '../property/name/device.instance.name.component';
import {DescriptionComponent} from '../../../../../../../../../common/form/item/common/description/description.component';
import {DeviceInstanceArgumentsComponent} from '../action/arguments/device.instance.arguments.component';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {TranslatePipe} from '@ngx-translate/core';
import {InstanceOp} from '../../../../../../../../../typedef/instance/InstanceEditor';

@Component({
  selector: 'device-instance-service-event',
  templateUrl: './device.instance.service.event.component.html',
  styleUrl: './device.instance.service.event.component.less',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzCheckboxModule,
    NzRadioModule,
    NzSpaceModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzFlexDirective,
    DeviceInstanceIdComponent,
    DeviceInstanceNameComponent,
    DescriptionComponent,
    DeviceInstanceArgumentsComponent,
    TranslatePipe
  ],
  providers: [
    NzModalService
  ],
})
export class DeviceInstanceServiceEventComponent {

  protected readonly LifeCycle = LifeCycle;

  editable = input(false);
  service = input.required<Service>();
  event = input.required<Event>();
  @Output() op = new EventEmitter<InstanceOp>();

  /** 子 CVA 仍按 lifecycle 门控：可编辑 ⇔ 组织匹配且 DEV，否则喂 RELEASED（只读）。 */
  protected subLifecycle = computed(() => this.editable() ? LifeCycle.DEVELOPMENT : LifeCycle.RELEASED);

  /** 当前界面语言（叶子不再从父级收 language，直接取 i18n）。 */
  protected get language(): string {
    return this.i18n.getCurrentLang();
  }

  form: FormGroup<{
    iid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    arguments: FormControl<Argument[]>,
  }>;

  /** 已加载的事件 iid：只在切到别的节点时 reload，同 iid 自提交不复位表单。 */
  private loadedEventIid: number | undefined = undefined;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private fb: NonNullableFormBuilder,
    public i18n: MainI18nService
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      arguments: this.fb.control<Argument[]>([]),
    });

    effect(() => {
      const e = this.event();
      if (this.loadedEventIid !== e.iid) {
        this.loadedEventIid = e.iid;
        this.reload(e);
      }
    });
  }

  private reload(event: Event) {
    this.form.controls.iid.setValue(event.iid);
    this.form.controls.code.setValue(event.type.name);
    this.form.controls.description.setValue(event.description);
    this.form.controls.arguments.setValue(this.argumentRows(event.arguments));
  }

  /** 从 live Map 抽出行 → 逐项克隆为新的 Argument（行内编辑永不落到树上的参数对象）。 */
  private argumentRows(map: Map<number, Argument>): Argument[] {
    const svc = this.service();
    const rows: Argument[] = [];
    map.forEach((arg, key) => {
      if (key === arg.piid && svc.properties.has(arg.piid)) {
        rows.push(Argument.of(arg.piid, arg.minRepeat, arg.maxRepeat));
      }
    });
    return rows;
  }

  /** 行数组 → 新 Map（key = piid；min/max 从行内克隆，杜绝把表单对象别名进模型）。 */
  private rowsToMap(rows: Argument[]): Map<number, Argument> {
    const map = new Map<number, Argument>();
    for (const row of rows) {
      map.set(row.piid, Argument.of(row.piid, row.minRepeat, row.maxRepeat));
    }
    return map;
  }

  onRemoved() {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个事件吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.event().description.get('zh-CN') || '?',
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
        this.op.emit({kind: 'removeEvent', serviceIid: this.service().iid, eventIid: this.event().iid});
      }
    });
  }

  protected get updatable(): boolean {
    const e = this.event();
    return e.type.ns === e.type.organization;
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');

    if (this.event().iid !== this.form.controls.iid.value) {
      this.op.emit({
        kind: 'updateEvent',
        serviceIid: this.service().iid,
        eventIid: this.event().iid,
        patch: {iid: this.form.controls.iid.value},
      });
    }
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');

    if (this.event().type.name !== this.form.controls.code.value) {
      this.op.emit({
        kind: 'updateEvent',
        serviceIid: this.service().iid,
        eventIid: this.event().iid,
        patch: {name: this.form.controls.code.value},
      });
    }
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');

    this.op.emit({
      kind: 'updateEvent',
      serviceIid: this.service().iid,
      eventIid: this.event().iid,
      patch: {description: this.form.controls.description.value},
    });
  }

  protected onArgumentsChanged(): void {
    console.log('onArgumentsChanged');

    this.op.emit({
      kind: 'updateEvent',
      serviceIid: this.service().iid,
      eventIid: this.event().iid,
      patch: {arguments: this.rowsToMap(this.form.controls.arguments.value)},
    });
  }
}
