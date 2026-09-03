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
import {Action, Argument, LifeCycle, Service} from '@openxiot/xiot-core-spec-ts';
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
import {DeviceInstanceDescriptionComponent} from '../property/description/device.instance.description.component';
import {DeviceInstanceArgumentsComponent} from './arguments/device.instance.arguments.component';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {TranslatePipe} from '@ngx-translate/core';
import {InstanceOp} from '../../../../../../../../../typedef/instance/InstanceEditor';

@Component({
  selector: 'device-instance-service-action',
  templateUrl: './device.instance.service.action.component.html',
  styleUrl: './device.instance.service.action.component.less',
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
    DeviceInstanceIdComponent,
    DeviceInstanceNameComponent,
    DeviceInstanceDescriptionComponent,
    DeviceInstanceArgumentsComponent,
    NzFlexDirective,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class DeviceInstanceServiceActionComponent {

  protected readonly LifeCycle = LifeCycle;

  editable = input(false);
  service = input.required<Service>();
  action = input.required<Action>();
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
    argumentsIn: FormControl<Argument[]>,
    argumentsOut: FormControl<Argument[]>,
  }>;

  /** 已加载的方法 iid：只在切到别的节点时 reload，同 iid 自提交不复位表单。 */
  private loadedActionIid: number | undefined = undefined;

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
      argumentsIn: this.fb.control<Argument[]>([]),
      argumentsOut: this.fb.control<Argument[]>([]),
    });

    effect(() => {
      const a = this.action();
      if (this.loadedActionIid !== a.iid) {
        this.loadedActionIid = a.iid;
        this.reload(a);
      }
    });
  }

  private reload(action: Action) {
    this.form.controls.iid.setValue(action.iid);
    this.form.controls.code.setValue(action.type.name);
    this.form.controls.description.setValue(action.description);
    this.form.controls.argumentsIn.setValue(this.argumentRows(action.in));
    this.form.controls.argumentsOut.setValue(this.argumentRows(action.out));
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
      nzTitle: this.i18n.translate.instant('您真的要删除这个方法吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.action().description.get('zh-CN') || '?',
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
        this.op.emit({kind: 'removeAction', serviceIid: this.service().iid, actionIid: this.action().iid});
      }
    });
  }

  protected get updatable(): boolean {
    const a = this.action();
    return a.type.ns === a.type.organization;
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');

    if (this.action().iid !== this.form.controls.iid.value) {
      this.op.emit({
        kind: 'updateAction',
        serviceIid: this.service().iid,
        actionIid: this.action().iid,
        patch: {iid: this.form.controls.iid.value},
      });
    }
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');

    if (this.action().type.name !== this.form.controls.code.value) {
      this.op.emit({
        kind: 'updateAction',
        serviceIid: this.service().iid,
        actionIid: this.action().iid,
        patch: {name: this.form.controls.code.value},
      });
    }
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');

    this.op.emit({
      kind: 'updateAction',
      serviceIid: this.service().iid,
      actionIid: this.action().iid,
      patch: {description: this.form.controls.description.value},
    });
  }

  protected onArgumentsInChanged(): void {
    console.log('onArgumentsInChanged');

    this.op.emit({
      kind: 'updateAction',
      serviceIid: this.service().iid,
      actionIid: this.action().iid,
      patch: {in: this.rowsToMap(this.form.controls.argumentsIn.value)},
    });
  }

  protected onArgumentsOutChanged(): void {
    console.log('onArgumentsOutChanged');

    this.op.emit({
      kind: 'updateAction',
      serviceIid: this.service().iid,
      actionIid: this.action().iid,
      patch: {out: this.rowsToMap(this.form.controls.argumentsOut.value)},
    });
  }
}
