import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {BreadcrumbTranslateDirective} from '../../../../../common/component/breadcrumb/breadcrumb-translate.directive';
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
import {DescriptionComponent} from '../../../../../common/form/item/common/description/description.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {UuidComponent} from '../../../../../common/form/item/common/uuid/uuid.component';
import {LifecycleComponent} from '../../../../../common/form/item/common/lifecycle/lifecycle.component';
import {SpecCodeComponent} from '../../../../../common/form/item/common/code/spec.code.component';
import {Location} from '@angular/common';

@Component({
  selector: 'spec-device-create',
  standalone: true,
  templateUrl: './spec.device.create.component.html',
  styleUrls: ['./spec.device.create.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    BreadcrumbTranslateDirective,
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
    LifecycleComponent,
    SpecCodeComponent,
  ],
})
export class SpecDeviceCreateComponent implements OnInit {

  loading: boolean = false;

  form: FormGroup<{
    uuid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    lifecycle: FormControl<LifeCycle>,
  }>;

  constructor(
    protected location: Location,
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
        Validators.pattern(/^[a-z][a-z0-9-]*$/)
      ]),

      uuid: this.fb.control(0, [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      lifecycle: this.fb.control(LifeCycle.DEVELOPMENT, [Validators.required]),
    });
  }

  ngOnInit() {
  }

  protected submitForm() {
    console.log('submitForm');

    const code = this.form.value.code || 'null';
    const value = this.form.value.uuid || 0;
    const uuid = value.toString(16).padStart(8, '0');
    const description = this.form.value.description || new Map<string, string>();
    const lifecycle = this.form.value.lifecycle || LifeCycle.DEVELOPMENT;

    const type: DeviceType = DeviceType.create(this.account.ns.namespace, UrnType.DEVICE, code, uuid);
    const device: DeviceDefinition = new DeviceDefinition(type, description);
    device.lifecycle = lifecycle;

    this.loading = true;
    this.service.createDeviceDefinition(device)
      .subscribe({
        next: () => {
          console.log('createDeviceDefinition ok');
          this.loading = false;
          this.router.navigate(['/main/spec']).then(() => {});
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }
}
