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
import {MainService} from '../../../../service/main.service';
import {Location} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {DescriptionComponent} from '../../../../common/form/item/common/description/description.component';
import {DeviceTypeComponent} from '../../../../common/form/item/common/device/device.type.component';
import {DeviceDefinition, DeviceTemplate, DeviceType, LifeCycle} from '@openxiot/xiot-core-spec-ts';
import {AccountService} from '../../../../service/account.service';
import {BreadcrumbTranslateDirective} from '../../../../common/component/breadcrumb/breadcrumb-translate.directive';

@Component({
  selector: 'template-create',
  standalone: true,
  templateUrl: './template.create.component.html',
  styleUrls: ['./template.create.component.less'],
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
    TranslatePipe,
    DescriptionComponent,
    DeviceTypeComponent,
    BreadcrumbTranslateDirective
  ],
})
export class TemplateCreateComponent implements OnInit {

  loading: boolean = false;
  devices: DeviceDefinition[] = [];

  form: FormGroup<{
    device: FormControl<string>,
    model: FormControl<string>,
    description: FormControl<Map<string, string>>,
  }>;

  constructor(
    protected location: Location,
    private account: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private msg: NzMessageService,
    private service: MainService,
  ) {
    this.form = this.fb.group({
      device: this.fb.control('', [Validators.required]),
      model: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
    });
  }

  ngOnInit() {
    this.loadDeviceDefinitions();
  }

  private loadDeviceDefinitions(): void {
    if (this.account.ns) {
      this.loading = true;
      this.service.getDeviceDefinitions(this.account.ns.namespace)
        .subscribe({
          next: data => {
            console.log('getDeviceDefinitions: ', data.length);
            this.devices = data;
            this.loading = false;
          },
          error: error => {
            this.msg.warning(error);
          }
        })
    }
  }

  protected submitForm() {
    const device = this.form.value.device || '';
    const model = this.form.value.model || '';
    const description = this.form.value.description || new Map<string, string>();

    const found = this.devices.find(x => x.type.name === device);
    if (found) {
      const type = DeviceType.parse(found.type.toString() + ":" + this.account.organization.id + ":" + model + ":1");
      console.log("type: " + type.toString());

      const template: DeviceTemplate = new DeviceTemplate(type, description, []);
      template.lifecycle = LifeCycle.DEVELOPMENT;

      this.loading = true;
      this.service.createTemplate(template)
        .subscribe({
          next: () => {
            console.log('createTemplate ok');
            this.loading = false;
            this.router.navigate(['/main/template']).then(() => {});
          },
          error: error => {
            this.msg.warning(error);
            this.loading = false;
          }
        });
    }
  }
}
