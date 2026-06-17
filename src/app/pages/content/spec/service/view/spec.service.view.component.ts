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

@Component({
  selector: 'spec-service-view',
  standalone: true,
  templateUrl: './spec.service.view.component.html',
  styleUrls: ['./spec.service.view.component.less'],
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
    LifecycleComponent,
    UuidComponent,
    ServiceDefinitionPropertiesComponent,
    ServiceDefinitionEventsComponent,
    ServiceDefinitionActionsComponent,
  ],
})
export class SpecServiceViewComponent implements OnInit {

  loading: boolean = false;
  serviceType: string = '';

  loadingProperties: boolean = false;
  properties: PropertyDefinition[] = [];
  propertyMap: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingActions: boolean = false;
  actions: ActionDefinition[] = [];
  actionMap: Map<string, ActionDefinition> = new Map<string, ActionDefinition>();

  loadingEvents: boolean = false;
  events: EventDefinition[] = [];
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
    this.route.params.subscribe(params => {
      this.serviceType = params['type'] || '';
      this.loadProperties();
    });
  }

  private loadService() {
    this.loading = true;
    this.service.getServiceDefinition(this.serviceType)
      .subscribe({
        next: a => {

          this.form.controls.code.setValue(a.type.name);
          this.form.controls.uuid.setValue(a.type.value);
          this.form.controls.description.setValue(a.description);
          this.form.controls.lifecycle.setValue(a.lifecycle);

          const requiredProperties = a.requiredProperties
            .map(x => {
              let def = this.propertyMap.get(x.name);
              if (def == null) {
                def = new PropertyDefinition(x, new Map<string, string>())
              }
              return def;
            });

          this.form.controls.requiredProperties.setValue(requiredProperties);

          const optionalProperties = a.requiredProperties
            .map(x => {
              let def = this.propertyMap.get(x.name);
              if (def == null) {
                def = new PropertyDefinition(x, new Map<string, string>())
              }
              return def;
            });

          this.form.controls.optionalProperties.setValue(optionalProperties);

          const requiredActions = a.requiredActions
            .map(x => {
              let def = this.actionMap.get(x.name);
              if (def == null) {
                def = new ActionDefinition(x, new Map<string, string>(), [], [])
              }
              return def;
            });

          this.form.controls.requiredActions.setValue(requiredActions);

          const optionalActions = a.optionalActions
            .map(x => {
              let def = this.actionMap.get(x.name);
              if (def == null) {
                def = new ActionDefinition(x, new Map<string, string>(), [], [])
              }
              return def;
            });

          this.form.controls.optionalActions.setValue(optionalActions);

          const requiredEvent = a.requiredEvents
            .map(x => {
              let def = this.eventMap.get(x.name);
              if (def == null) {
                def = new EventDefinition(x, new Map<string, string>(), [])
              }
              return def;
            });

          this.form.controls.requiredProperties.setValue(requiredProperties);

          const optionalEvents = a.optionalEvents
            .map(x => {
              let def = this.eventMap.get(x.name);
              if (def == null) {
                def = new EventDefinition(x, new Map<string, string>(), [])
              }
              return def;
            });

          this.form.controls.optionalEvents.setValue(optionalEvents);

          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      });
  }

  private loadProperties(): void {
    this.loadingProperties = true;
    this.service.getPropertyDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.properties = data;
          this.propertyMap = new Map(data.map(item => [item.type.name, item]));
          this.loadingProperties = false;
          this.loadActions();
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
          this.actionMap = new Map(data.map(item => [item.type.name, item]));
          this.loadingActions = false;
          this.loadEvents();
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
          this.eventMap = new Map(data.map(item => [item.type.name, item]));
          this.loadingEvents = false;
          this.loadService();
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected onBack() {
    this.router.navigate(['/main/spec']).then(() => {});
  }
}
