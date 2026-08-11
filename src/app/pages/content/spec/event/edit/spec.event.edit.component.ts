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
import {
  EventDefinition,
  EventType,
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
  selector: 'spec-event-edit',
  standalone: true,
  templateUrl: './spec.event.edit.component.html',
  styleUrl: './spec.event.edit.component.less',
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
export class SpecEventEditComponent implements OnInit {

  loading = signal(false);
  properties = signal<PropertyDefinition[]>([]);
  eventType: string = '';

  form: FormGroup<{
    uuid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    arguments: FormControl<ArgumentDefinition[]>,
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
      arguments: this.fb.control<ArgumentDefinition[]>([]),
      lifecycle: this.fb.control(LifeCycle.DEVELOPMENT, [Validators.required]),
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.eventType = params['type'] || '';
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
          this.loadEventDefinition(this.eventType);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      })
  }

  private loadEventDefinition(type: string) {
    this.loading.set(true);

    this.service.getEventDefinition(type)
      .subscribe({
        next: (a) => {
          console.log('getEventDefinition ok');

          this.form.controls.code.setValue(a.type.name);
          this.form.controls.uuid.setValue(a.type.value);
          this.form.controls.description.setValue(a.description);
          this.form.controls.lifecycle.setValue(a.lifecycle);

          this.form.controls.arguments.setValue(a.arguments);

          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      });
  }

  protected submitForm() {
    const value = this.form.value.uuid || 0;
    const uuid = value.toString(16).padStart(8, '0');
    const code = this.form.value.code || 'null';
    const description = this.form.value.description || new Map<string, string>();
    const args: ArgumentDefinition[] = this.form.value.arguments || [];
    const lifecycle = this.form.value.lifecycle || LifeCycle.DEVELOPMENT;

    const type: EventType = EventType.create(this.account.ns().namespace, UrnType.EVENT, code, uuid);
    const def: EventDefinition = new EventDefinition(type, description, args);
    def.lifecycle = lifecycle;

    this.loading.set(true);
    this.service.updateEventDefinition(def)
      .subscribe({
        next: () => {
          console.log('updateEventDefinition ok');
          this.loading.set(false);
          this.router.navigate(['/main/spec']).then(() => {
          });
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      });
  }
}
