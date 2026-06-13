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
import {DeviceType, NamespaceDefinition, ProductBasic, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../service/main.service';
import {DescriptionComponent} from '../../../../common/description/description.component';
import {AccountService} from '../../../../service/account.service';

@Component({
  selector: 'namespace-create',
  standalone: true,
  templateUrl: './namespace.create.component.html',
  styleUrls: ['./namespace.create.component.less'],
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
  ],
})
export class NamespaceCreateComponent implements OnInit {

  loading: boolean = false;

  form: FormGroup<{
    name: FormControl<string>,
    description: FormControl<Map<string, string>>,
  }>;

  constructor(
    private router: Router,
    private account: AccountService,
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private msg: NzMessageService,
    private service: MainService,
  ) {
    this.form = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
    });
  }

  ngOnInit() {
  }

  protected onBack() {
    this.router.navigate(['/main/product']).then(() => {});
  }

  protected submitForm() {
    const name = this.form.value.name || 'null';
    const description = new Map<string, string>();
    description.set('en-US', this.form.value.description?.get('en-US') || 'null');
    description.set('zh-CN', this.form.value.description?.get('zh-CN') || 'null');

    const namespace: NamespaceDefinition = new NamespaceDefinition(name, description);

    this.loading = true;
    this.service.createNamespace(this.account.organizationId, namespace)
      .subscribe({
        next: () => {
          console.log('updateProduct ok');
          this.loading = false;
          this.router.navigate(['/main/namespace']).then(() => {});
        },
        error: error => {
          this.msg.warning('Failed to createProduct', error);
          this.loading = false;
        }
      });
  }
}
