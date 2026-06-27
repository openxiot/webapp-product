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
import {
  FormatDefinition,
  FormatType,
  LifeCycle,
  UrnType
} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {DescriptionComponent} from '../../../../../common/form/item/common/description/description.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {LifecycleComponent} from '../../../../../common/form/item/common/lifecycle/lifecycle.component';
import {SpecCodeComponent} from '../../../../../common/form/item/common/code/spec.code.component';
import {Location} from '@angular/common';

@Component({
  selector: 'spec-format-edit',
  standalone: true,
  templateUrl: './spec.format.edit.component.html',
  styleUrls: ['./spec.format.edit.component.less'],
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
    LifecycleComponent,
    SpecCodeComponent,
  ],
})
export class SpecFormatEditComponent implements OnInit {

  loading: boolean = false;

  form: FormGroup<{
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

    this.service.getFormatDefinition(type)
      .subscribe({
        next: (namespace) => {
          this.form.controls.code.setValue(namespace.type.name);
          this.form.controls.description.setValue(namespace.description);
          this.form.controls.lifecycle.setValue(namespace.lifecycle);
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }

  protected submitForm() {
    const code = this.form.value.code || 'null';
    const description = this.form.value.description || new Map<string, string>();
    const lifecycle = this.form.value.lifecycle || LifeCycle.DEVELOPMENT;

    const type: FormatType = FormatType.create(this.account.ns.namespace, UrnType.FORMAT, code, '0000');
    const def: FormatDefinition = new FormatDefinition(type, description);
    def.lifecycle = lifecycle;

    this.loading = true;
    this.service.updateFormatDefinition(def)
      .subscribe({
        next: () => {
          console.log('updateFormatDefinition ok');
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
