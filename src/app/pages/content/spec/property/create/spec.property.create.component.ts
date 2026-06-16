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
import {Access, DataFormat} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {DescriptionComponent} from '../../../../../common/form/item/common/description/description.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {CodeComponent} from '../../../../../common/form/item/common/code/code.component';
import {PropertyFormatComponent} from '../../../../../common/form/item/property/format/property.format.component';
import {PropertyAccessComponent} from '../../../../../common/form/item/property/access/property.access.component';
import {PropertyUnitComponent} from '../../../../../common/form/item/property/unit/property.unit.component';

@Component({
  selector: 'spec-property-create',
  standalone: true,
  templateUrl: './spec.property.create.component.html',
  styleUrls: ['./spec.property.create.component.less'],
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
    CodeComponent,
    PropertyFormatComponent,
    PropertyAccessComponent,
    PropertyUnitComponent,
  ],
})
export class SpecPropertyCreateComponent implements OnInit {

  loading: boolean = false;

  form: FormGroup<{
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    access: FormControl<Access>,
    format: FormControl<DataFormat>,
    unit: FormControl<string>,
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
      code: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      access: this.fb.control(new Access(), [Validators.required]),
      format: this.fb.control(DataFormat.STRING, [Validators.required]),
      unit: this.fb.control('', [Validators.required]),
    });
  }

  ngOnInit() {
  }

  protected onBack() {
    this.router.navigate(['/main/spec']).then(() => {});
  }

  protected submitForm() {
    const code = this.form.value.code || 'null';
    const description = new Map<string, string>();
    description.set('en-US', this.form.value.description?.get('en-US') || 'null');
    description.set('zh-CN', this.form.value.description?.get('zh-CN') || 'null');

    // const type: DeviceType = DeviceType.create(this.account.ns.namespace, UrnType.DEVICE, code, '0000');
    // const device: DeviceDefinition = new DeviceDefinition(type, description);

    // this.loading = true;
    // this.service.createSpecDevice(this.account.organization.id, device)
    //   .subscribe({
    //     next: () => {
    //       console.log('updateProduct ok');
    //       this.loading = false;
    //       this.router.navigate(['/main/namespace']).then(() => {});
    //     },
    //     error: error => {
    //       this.msg.warning('Failed to createProduct', error);
    //       this.loading = false;
    //     }
    //   });
  }
}
