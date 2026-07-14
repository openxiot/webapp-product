import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef} from '@angular/core';
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
import {DeviceInstanceNamespaceComponent} from '../property/namespace/device.instance.namespace.component';
import {ConfirmComponent} from '../../../../../../../../../common/dialog/confirm/confirm.component';
import {MainI18nService} from '../../../../../../../../../service/i18n.service';
import {DeviceInstanceIdComponent} from '../property/iid/device.instance.id.component';
import {DeviceInstanceNameComponent} from '../property/name/device.instance.name.component';
import {DeviceInstanceDescriptionComponent} from '../property/description/device.instance.description.component';
import {areMapsEqual} from '../../../../../../../../../typedef/utils/MapUtils';
import {NzFlexModule} from 'ng-zorro-antd/flex';
import {TranslatePipe} from '@ngx-translate/core';

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
    DeviceInstanceNamespaceComponent,
    DeviceInstanceIdComponent,
    DeviceInstanceNameComponent,
    DeviceInstanceDescriptionComponent,
    TranslatePipe
  ],
  providers: [
    NzModalService
  ],
})
export class DeviceInstanceServiceDetailComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;
  private loading: boolean = false;

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Input() service!: Service;
  @Input() language!: string;
  @Output() removed = new EventEmitter<Service>();
  @Output() changed = new EventEmitter<Service>();

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
  }>;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private fb: NonNullableFormBuilder,
    public i18n: MainI18nService
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.loading = true;

    this.form.controls.iid.setValue(this.service.iid);
    this.form.controls.ns.setValue(this.service.type.ns);
    this.form.controls.code.setValue(this.service.type.name);
    this.form.controls.description.setValue(this.service.description);

    this.loading = false;
  }

  onRemoved() {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个功能吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.service.description.get('zh-CN') || '?',
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
        this.removed.emit(this.service);
      }
    });
  }

  protected get updatable(): boolean {
    if (this.service) {
      return this.service.type.ns === this.service.type.organization;
    }

    return false;
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');

    if (! this.loading) {
      if (this.service.iid !== this.form.controls.iid.value) {
        this.service.iid = this.form.controls.iid.value;
        this.changed.emit(this.service);
      }
    }
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');

    if (!this.loading) {
      if (this.service.type.name !== this.form.controls.code.value) {
        this.service.type.name = this.form.controls.code.value;
        this.changed.emit(this.service);
      }
    }
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');

    if (!this.loading) {
      const value: Map<string, string> = this.form.controls.description.value;
      if (! areMapsEqual(this.service.description, value)) {
        this.service.description = value;
        this.changed.emit(this.service);
      }
    }
  }
}
