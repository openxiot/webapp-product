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
  ActionDefinition,
  ActionType,
  ArgumentDefinition,
  LifeCycle,
  PropertyDefinition,
  UrnType
} from '@openxiot/xiot-core-spec-ts';
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
  selector: 'spec-action-edit',
  standalone: true,
  templateUrl: './spec.action.edit.component.html',
  styleUrls: ['./spec.action.edit.component.less'],
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
export class SpecActionEditComponent implements OnInit {

  loading: boolean = false;
  properties: PropertyDefinition[] = [];
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
    private router: Router,
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
    this.loading = true;
    this.service.getPropertyDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.properties = data;
          this.loading = false;
          this.loadActionDefinition(this.actionType);
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  private loadActionDefinition(type: string) {
    this.loading = true;

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

          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }

  protected submitForm() {
    const value = this.form.value.uuid || 0;
    const uuid = value.toString(16).padStart(8, '0');
    const code = this.form.value.code || 'null';
    const description = this.form.value.description || new Map<string, string>();
    const argumentsIn: ArgumentDefinition[] = this.form.value.argumentsIn || [];
    const argumentsOut: ArgumentDefinition[] = this.form.value.argumentsOut || [];
    const lifecycle = this.form.value.lifecycle || LifeCycle.DEVELOPMENT;

    const type: ActionType = ActionType.create(this.account.ns.namespace, UrnType.ACTION, code, uuid);
    const def: ActionDefinition = new ActionDefinition(type, description, argumentsIn, argumentsOut);
    def.lifecycle = lifecycle;

    this.loading = true;
    this.service.updateActionDefinition(def)
      .subscribe({
        next: () => {
          console.log('updateActionDefinition ok');
          this.loading = false;
          this.router.navigate(['/main/spec']).then(() => {
          });
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }
}
