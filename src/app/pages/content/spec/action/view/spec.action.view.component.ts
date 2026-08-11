import {Component, OnInit, signal} from '@angular/core';
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
import {ArgumentDefinition, LifeCycle, PropertyDefinition} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {DescriptionComponent} from '../../../../../common/form/item/common/description/description.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {SpecCodeComponent} from '../../../../../common/form/item/common/code/spec.code.component';
import {UuidComponent} from '../../../../../common/form/item/common/uuid/uuid.component';
import {LifecycleComponent} from '../../../../../common/form/item/common/lifecycle/lifecycle.component';
import {
  DefinitionArgumentsComponent
} from '../../../../../common/form/item/action/def/arguments/definition.arguments.component';
import {Location} from '@angular/common';

@Component({
  selector: 'spec-action-view',
  standalone: true,
  templateUrl: './spec.action.view.component.html',
  styleUrl: './spec.action.view.component.less',
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
    SpecCodeComponent,
    UuidComponent,
    LifecycleComponent,
    DefinitionArgumentsComponent,
  ],
})
export class SpecActionViewComponent implements OnInit {

  loading = signal(false);
  properties = signal<PropertyDefinition[]>([]);
  actionType: string = '';

  form: FormGroup<{
    uuid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    argumentsIn: FormControl<ArgumentDefinition[]>,
    argumentsOut: FormControl<ArgumentDefinition[]>,
    lifecycle: FormControl<LifeCycle>,
  }>;

  constructor(
    protected location: Location,
    protected account: AccountService,
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private service: MainService,
    private msg: NzMessageService,
  ) {
    this.form = this.fb.group({
      code: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-z][a-z0-9-]*$/)
      ]),
      uuid: this.fb.control(0, [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      argumentsIn: this.fb.control<ArgumentDefinition[]>([]),
      argumentsOut: this.fb.control<ArgumentDefinition[]>([]),
      lifecycle: this.fb.control(LifeCycle.DEVELOPMENT, [Validators.required]),
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.actionType = params['type'] || '';
      this.load();
    });
  }

  private load(): void {
    this.loading.set(true);
    this.service.getPropertyDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.properties.set(data);
          this.loading.set(false);
          this.loadActionDefinition(this.actionType);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      })
  }

  private loadActionDefinition(type: string) {
    this.loading.set(true);

    this.service.getActionDefinition(type)
      .subscribe({
        next: (a) => {
          console.log('getActionDefinition ok');

          this.form.controls.code.setValue(a.type.name);
          this.form.controls.uuid.setValue(a.type.value);
          this.form.controls.description.setValue(a.description);
          this.form.controls.lifecycle.setValue(a.lifecycle);

          this.form.controls.argumentsIn.setValue(a.in);
          this.form.controls.argumentsOut.setValue(a.out);

          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      });
  }
}
