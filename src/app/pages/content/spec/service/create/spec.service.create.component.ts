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
  EventDefinition, LifeCycle,
  PropertyDefinition, ServiceDefinition, ServiceType,
  UrnType
} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {DescriptionComponent} from '../../../../../common/form/item/common/description/description.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {CodeComponent} from '../../../../../common/form/item/common/code/code.component';
import {LifecycleComponent} from '../../../../../common/form/item/common/lifecycle/lifecycle.component';
import {UuidComponent} from '../../../../../common/form/item/common/uuid/uuid.component';
import {
  ServiceDefinitionPropertiesComponent
} from '../../../../../common/form/item/service/def/property/service.definition.properties.component';
import {
  ServiceDefinitionEventsComponent
} from '../../../../../common/form/item/service/def/event/service.definition.events.component';
import {
  ServiceDefinitionActionsComponent
} from '../../../../../common/form/item/service/def/action/service.definition.actions.component';
import {Location} from '@angular/common';

@Component({
  selector: 'spec-service-create',
  standalone: true,
  templateUrl: './spec.service.create.component.html',
  styleUrls: ['./spec.service.create.component.less'],
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
    CodeComponent,
    LifecycleComponent,
    UuidComponent,
    ServiceDefinitionPropertiesComponent,
    ServiceDefinitionEventsComponent,
    ServiceDefinitionActionsComponent,
  ],
})
export class SpecServiceCreateComponent implements OnInit {

  loadingProperties: boolean = false;
  properties: PropertyDefinition[] = [];

  loadingActions: boolean = false;
  actions: ActionDefinition[] = [];

  loadingEvents: boolean = false;
  events: EventDefinition[] = [];

  form: FormGroup<{
    uuid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    requiredProperties: FormControl<PropertyDefinition[]>,
    optionalProperties: FormControl<PropertyDefinition[]>,
    requiredActions: FormControl<ActionDefinition[]>,
    optionalActions: FormControl<ActionDefinition[]>,
    requiredEvents: FormControl<EventDefinition[]>,
    optionalEvents: FormControl<EventDefinition[]>,
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
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9-]*$/)
      ]),
      uuid: this.fb.control(0, [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      requiredProperties: this.fb.control<PropertyDefinition[]>([]),
      optionalProperties: this.fb.control<PropertyDefinition[]>([]),
      requiredActions: this.fb.control<ActionDefinition[]>([]),
      optionalActions: this.fb.control<ActionDefinition[]>([]),
      requiredEvents: this.fb.control<EventDefinition[]>([]),
      optionalEvents: this.fb.control<EventDefinition[]>([]),
      lifecycle: this.fb.control(LifeCycle.DEVELOPMENT, [Validators.required]),
    });
  }

  ngOnInit() {
    this.loadProperties();
    this.loadActions();
    this.loadEvents();
  }

  private loadProperties(): void {
    this.loadingProperties = true;
    this.service.getPropertyDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.properties = data;
          this.loadingProperties = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  private loadActions(): void {
    this.loadingActions = true;
    this.service.getActionDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.actions = data;
          this.loadingActions = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  private loadEvents(): void {
    this.loadingEvents = true;
    this.service.getEventDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.events = data;
          this.loadingEvents = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected submitForm() {
    const value = this.form.value.uuid || 0;
    const uuid = value.toString(16).padStart(8, '0');
    const code = this.form.value.code || 'null';
    const description = this.form.value.description || new Map<string, string>();
    const lifecycle = this.form.value.lifecycle || LifeCycle.DEVELOPMENT;

    const requiredProperties = this.form.controls.requiredProperties.value.map(x => x.type);
    const optionalProperties = this.form.controls.optionalProperties.value.map(x => x.type);
    const requiredActions = this.form.controls.requiredActions.value.map(x => x.type);
    const optionalActions = this.form.controls.optionalActions.value.map(x => x.type);
    const requiredEvents = this.form.controls.requiredEvents.value.map(x => x.type);
    const optionalEvents = this.form.controls.optionalEvents.value.map(x => x.type);

    const type: ServiceType = ServiceType.create(this.account.ns.namespace, UrnType.SERVICE, code, uuid);
    const def: ServiceDefinition = new ServiceDefinition(type, description,
      requiredProperties, optionalProperties,
      requiredActions, optionalActions,
      requiredEvents, optionalEvents);
    def.lifecycle = lifecycle;

    this.loadingActions = true;
    this.service.createServiceDefinition(def)
      .subscribe({
        next: () => {
          console.log('createServiceDefinition ok');
          this.loadingActions = false;
          this.router.navigate(['/main/spec']).then(() => {
          });
        },
        error: error => {
          this.msg.warning(error);
          this.loadingActions = false;
        }
      });
  }
}
