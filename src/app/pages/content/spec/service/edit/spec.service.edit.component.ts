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
  ActionDefinition, ActionType,
  EventDefinition, EventType, LifeCycle,
  PropertyDefinition, ServiceDefinition, ServiceType,
  UrnType
} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {DescriptionComponent} from '../../../../../common/form/item/common/description/description.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {SpecCodeComponent} from '../../../../../common/form/item/common/code/spec.code.component';
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
  selector: 'spec-service-edit',
  standalone: true,
  templateUrl: './spec.service.edit.component.html',
  styleUrl: './spec.service.edit.component.less',
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
    LifecycleComponent,
    UuidComponent,
    ServiceDefinitionPropertiesComponent,
    ServiceDefinitionEventsComponent,
    ServiceDefinitionActionsComponent,
  ],
})
export class SpecServiceEditComponent implements OnInit {

  changed: boolean = false;
  loading = signal(false);
  serviceType: string = '';

  loadingProperties = signal(false);
  properties = signal<PropertyDefinition[]>([]);
  propertyMap: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingActions = signal(false);
  actions = signal<ActionDefinition[]>([]);
  actionMap: Map<string, ActionDefinition> = new Map<string, ActionDefinition>();

  loadingEvents = signal(false);
  events = signal<EventDefinition[]>([]);
  eventMap: Map<string, EventDefinition> = new Map<string, EventDefinition>();

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
        Validators.pattern(/^[a-z][a-z0-9-]*$/)
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
    this.route.params.subscribe(params => {
      this.serviceType = params['type'] || '';
      this.loadProperties();
    });
  }

  private loadService() {
    this.loading.set(true);
    this.service.getServiceDefinition(this.serviceType)
      .subscribe({
        next: a => {

          this.form.controls.code.setValue(a.type.name);
          this.form.controls.uuid.setValue(a.type.value);
          this.form.controls.description.setValue(a.description);
          this.form.controls.lifecycle.setValue(a.lifecycle);

          this.form.controls.requiredProperties.setValue(this.getProperties(a.requiredProperties));
          this.form.controls.requiredActions.setValue(this.getActions(a.requiredActions));
          this.form.controls.requiredEvents.setValue(this.getEvents(a.requiredActions));
          this.form.controls.optionalProperties.setValue(this.getProperties(a.optionalProperties));
          this.form.controls.optionalActions.setValue(this.getActions(a.optionalActions));
          this.form.controls.optionalEvents.setValue(this.getEvents(a.optionalEvents));

          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      });
  }

  private getProperties(properties: ActionType[]): PropertyDefinition[] {
    return properties
      .map(x => {
        let def = this.propertyMap.get(x.name);
        if (def == null) {
          def = new PropertyDefinition(x, new Map<string, string>())
        }
        return def;
      });
  }

  private getActions(actions: ActionType[]): ActionDefinition[] {
    return actions
      .map(x => {
        let def = this.actionMap.get(x.name);
        if (def == null) {
          def = new ActionDefinition(x, new Map<string, string>(), [], [])
        }
        return def;
      });
  }

  private getEvents(events: EventType[]): EventDefinition[] {
    return events
      .map(x => {
        let def = this.eventMap.get(x.name);
        if (def == null) {
          def = new EventDefinition(x, new Map<string, string>(), [])
        }
        return def;
      });
  }

  private loadProperties(): void {
    this.loadingProperties.set(true);
    this.service.getPropertyDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.properties.set(data);
          this.propertyMap = new Map(data.map(item => [item.type.name, item]));
          this.loadingProperties.set(false);
          this.loadActions();
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  private loadActions(): void {
    this.loadingActions.set(true);
    this.service.getActionDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.actions.set(data);
          this.actionMap = new Map(data.map(item => [item.type.name, item]));
          this.loadingActions.set(false);
          this.loadEvents();
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  private loadEvents(): void {
    this.loadingEvents.set(true);
    this.service.getEventDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.events.set(data);
          this.eventMap = new Map(data.map(item => [item.type.name, item]));
          this.loadingEvents.set(false);
          this.loadService();
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

    const type: ServiceType = ServiceType.create(this.account.ns().namespace, UrnType.SERVICE, code, uuid);
    const def: ServiceDefinition = new ServiceDefinition(type, description,
      requiredProperties, optionalProperties,
      requiredActions, optionalActions,
      requiredEvents, optionalEvents);
    def.lifecycle = lifecycle;

    this.loadingActions.set(true);
    this.service.updateServiceDefinition(def)
      .subscribe({
        next: () => {
          console.log('createServiceDefinition ok');
          this.loadingActions.set(false);
          this.router.navigate(['/main/spec']).then(() => {
          });
        },
        error: error => {
          this.msg.warning(error);
          this.loadingActions.set(false);
        }
      });
  }

  protected onChanged() {
    this.changed = true;
  }
}
