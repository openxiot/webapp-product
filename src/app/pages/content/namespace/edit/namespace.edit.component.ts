import {Component, OnInit, signal} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {BreadcrumbTranslateDirective} from '../../../../common/component/breadcrumb/breadcrumb-translate.directive';
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
import {NamespaceDefinition, Visibility} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../service/main.service';
import {DescriptionComponent} from '../../../../common/form/item/common/description/description.component';
import {AccountService} from '../../../../service/account.service';
import {VisibilityComponent} from '../../../../common/form/item/common/visibility/visibility.component';
import {NamespaceNsComponent} from './ns/namespace.ns.component';
import {Location} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'namespace-edit',
  standalone: true,
  templateUrl: './namespace.edit.component.html',
  styleUrl: './namespace.edit.component.less',
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
    VisibilityComponent,
    NamespaceNsComponent,
    TranslatePipe,
  ],
})
export class NamespaceEditComponent implements OnInit {

  loading = signal(false);

  form: FormGroup<{
    name: FormControl<string>,
    description: FormControl<Map<string, string>>,
    visibility: FormControl<Visibility>,
  }>;

  constructor(
    protected location: Location,
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
      visibility: this.fb.control(Visibility.PUBLIC, [Validators.required]),
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const ns: string = params['ns'] || '';
      this.load(ns);
    });
  }

  private load(ns: string) {
    console.log('reload');

    this.loading.set(true);

    this.service.getSpecNamespace(ns)
      .subscribe({
        next: (namespace) => {
          console.log('getSpecNamespace ok');

          this.form.controls.name.setValue(namespace.namespace);
          this.form.controls.description.setValue(namespace.description);
          this.form.controls.visibility.setValue(namespace.visibility);

          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      });
  }

  protected submitForm() {
    const visibility = this.form.value.visibility || Visibility.PRIVATE;
    const name = this.form.value.name || 'null';
    const description = new Map<string, string>();

    description.set('en-US', this.form.value.description?.get('en-US') || 'null');
    description.set('zh-CN', this.form.value.description?.get('zh-CN') || 'null');

    const def: NamespaceDefinition = new NamespaceDefinition(name, description);
    def.organization = this.account.organization().id;
    def.visibility = visibility;

    this.loading.set(true);
    this.service.updateSpecNamespace(def)
      .subscribe({
        next: () => {
          console.log('createNamespace ok');
          this.loading.set(false);
          this.router.navigate(['/main/namespace']).then(() => {});
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      });
  }
}
