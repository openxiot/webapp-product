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
import {DeviceDefinition, DeviceType, UrnType} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {DescriptionComponent} from '../../../../../common/form/item/description/description.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {UuidComponent} from '../../../../../common/form/item/uuid/uuid.component';

@Component({
  selector: 'spec-device-create',
  standalone: true,
  templateUrl: './spec.device.create.component.html',
  styleUrls: ['./spec.device.create.component.less'],
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
  ],
})
export class SpecDeviceCreateComponent implements OnInit {

  loading: boolean = false;

  form: FormGroup<{
    category: FormControl<string>,
    uuid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
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
      category: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      uuid: this.fb.control(0, [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
    });
  }

  ngOnInit() {
  }

  protected onBack() {
    this.router.navigate(['/main/spec']).then(() => {});
  }

  protected submitForm() {
    const category = this.form.value.category || 'null';
    const code = this.form.value.code || 'null';
    const value = this.form.value.uuid || 0;
    const uuid = value.toString(16).padStart(8, '0');
    const description = new Map<string, string>();
    description.set('en-US', this.form.value.description?.get('en-US') || 'null');
    description.set('zh-CN', this.form.value.description?.get('zh-CN') || 'null');

    const type: DeviceType = DeviceType.create(this.account.ns.namespace, UrnType.DEVICE, code, uuid);
    const device: DeviceDefinition = new DeviceDefinition(category, type, description);

    this.loading = true;
    this.service.createDeviceDefinition(device)
      .subscribe({
        next: () => {
          console.log('createSpecDevice ok');
          this.loading = false;
          this.router.navigate(['/main/spec']).then(() => {});
        },
        error: error => {
          this.msg.warning('Failed to createSpecDevice', error);
          this.loading = false;
        }
      });
  }
}
