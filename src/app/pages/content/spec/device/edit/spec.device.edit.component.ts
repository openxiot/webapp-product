import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzStepsModule} from 'ng-zorro-antd/steps';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {DeviceDefinition, DeviceType, LifeCycle, UrnType} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {DescriptionComponent} from '../../../../../common/form/item/description/description.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {UuidComponent} from '../../../../../common/form/item/uuid/uuid.component';
import {
  DeviceInstanceNameComponent
} from '../../../../../common/device/instance/service/split/detail/property/name/device.instance.name.component';
import {LifecycleComponent} from '../../../../../common/form/item/lifecycle/lifecycle.component';

@Component({
  selector: 'spec-device-edit',
  standalone: true,
  templateUrl: './spec.device.edit.component.html',
  styleUrls: ['./spec.device.edit.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzStepsModule,
    NzSpaceModule,
    NzDividerModule,
    ReactiveFormsModule,
    DescriptionComponent,
    TranslatePipe,
    UuidComponent,
    DeviceInstanceNameComponent,
    LifecycleComponent,
  ],
})
export class SpecDeviceEditComponent implements OnInit {

  loading: boolean = false;

  form: FormGroup<{
    uuid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    lifecycle: FormControl<LifeCycle>,
  }>;

  constructor(
    private router: Router,
    protected account: AccountService,
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private msg: NzMessageService,
    private service: MainService,
  ) {
    this.form = this.fb.group({

      code: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9-]*$/)
      ]),

      uuid: this.fb.control(0, [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      lifecycle: this.fb.control(LifeCycle.DEVELOPMENT, [Validators.required]),
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const type: string = params['type'] || '';
      this.load(type);
    });
  }

  private load(type: string) {
    console.log('reload');

    this.loading = true;

    this.service.getDeviceDefinition(type)
      .subscribe({
        next: (namespace) => {
          console.log('getSpecNamespace ok');

          this.form.controls.code.setValue(namespace.type.name);
          this.form.controls.uuid.setValue(namespace.type.value);
          this.form.controls.description.setValue(namespace.description);
          this.form.controls.lifecycle.setValue(namespace.lifecycle);

          this.loading = false;
        },
        error: error => {
          this.msg.warning('Failed to createNamespace', error);
          this.loading = false;
        }
      });
  }

  protected onBack() {
    this.router.navigate(['/main/spec']).then(() => {});
  }

  protected submitForm() {
    console.log('submitForm');

    const code = this.form.value.code || 'null';
    const value = this.form.value.uuid || 0;
    const uuid = value.toString(16).padStart(8, '0');
    const description = new Map<string, string>();
    description.set('en-US', this.form.value.description?.get('en-US') || 'null');
    description.set('zh-CN', this.form.value.description?.get('zh-CN') || 'null');
    const lifecycle = this.form.value.lifecycle || LifeCycle.DEVELOPMENT;

    const type: DeviceType = DeviceType.create(this.account.ns.namespace, UrnType.DEVICE, code, uuid);
    const device: DeviceDefinition = new DeviceDefinition(type, description);
    device.lifecycle = lifecycle;

    this.loading = true;
    this.service.updateDeviceDefinition(device)
      .subscribe({
        next: () => {
          console.log('updateDeviceDefinition ok');
          this.loading = false;
          this.router.navigate(['/main/spec']).then(() => {});
        },
        error: error => {
          this.msg.warning('Failed to updateDeviceDefinition', error);
          this.loading = false;
        }
      });
  }

  protected readonly LifeCycle = LifeCycle;
}
