import {Component, computed, effect, EventEmitter, input, Output, ViewContainerRef} from '@angular/core';
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
import {LifeCycle, Service} from '@openxiot/xiot-core-spec-ts';
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
import {NzFlexModule} from 'ng-zorro-antd/flex';
import {TranslatePipe} from '@ngx-translate/core';
import {InstanceOp} from '../../../../../../../../../typedef/instance/InstanceEditor';

@Component({
  selector: 'device-instance-service-detail',
  templateUrl: './device.instance.service.detail.component.html',
  styleUrl: './device.instance.service.detail.component.less',
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
    NzFlexModule,
    DeviceInstanceIdComponent,
    DeviceInstanceNameComponent,
    DescriptionComponent,
    TranslatePipe
  ],
  providers: [
    NzModalService
  ],
})
export class DeviceInstanceServiceDetailComponent {

  protected readonly LifeCycle = LifeCycle;

  editable = input(false);
  service = input.required<Service>();
  @Output() op = new EventEmitter<InstanceOp>();

  /** 子 CVA 仍按 lifecycle 门控：可编辑 ⇔ 组织匹配且 DEV，否则喂 RELEASED（只读）。 */
  protected subLifecycle = computed(() => this.editable() ? LifeCycle.DEVELOPMENT : LifeCycle.RELEASED);

  form: FormGroup<{
    iid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
  }>;

  /** 已加载的服务 iid：只在服务切换 / 服务自身 iid 被改时 reload，同 iid 自提交不复位表单。 */
  private loadedIid: number | undefined = undefined;

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
    });

    effect(() => {
      const s = this.service();
      if (this.loadedIid !== s.iid) {
        this.loadedIid = s.iid;
        this.reload(s);
      }
    });
  }

  private reload(service: Service) {
    this.form.controls.iid.setValue(service.iid);
    this.form.controls.code.setValue(service.type.name);
    this.form.controls.description.setValue(service.description);
  }

  onRemoved() {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个功能吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.service().description.get('zh-CN') || '?',
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
      console.log('onRemoved: ', result);

      if (result) {
        this.op.emit({kind: 'removeService', serviceIid: this.service().iid});
      }
    });
  }

  protected get updatable(): boolean {
    const s = this.service();
    return s.type.ns === s.type.organization;
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');

    if (this.service().iid !== this.form.controls.iid.value) {
      this.op.emit({
        kind: 'updateService',
        serviceIid: this.service().iid,
        patch: {iid: this.form.controls.iid.value},
      });
    }
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');

    if (this.service().type.name !== this.form.controls.code.value) {
      this.op.emit({
        kind: 'updateService',
        serviceIid: this.service().iid,
        patch: {name: this.form.controls.code.value},
      });
    }
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');

    this.op.emit({
      kind: 'updateService',
      serviceIid: this.service().iid,
      patch: {description: this.form.controls.description.value},
    });
  }
}
