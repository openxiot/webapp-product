import {Component, inject, OnInit, signal} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzFormModule} from 'ng-zorro-antd/form';
import {DeviceInstanceIdComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/iid/device.instance.id.component';
import {
  Access,
  LifeCycle,
  Service,
  ServiceDefinition,
  Property,
  PropertyType,
  PropertyDefinition,
  Action,
  ActionDefinition,
  ActionType,
  Event,
  EventType,
  EventDefinition,
  DataFormat, ServiceType,
} from '@openxiot/xiot-core-spec-ts';
import {DeviceInstanceNamespaceComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/namespace/device.instance.namespace.component';
import {DeviceInstanceNameComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/name/device.instance.name.component';
import {NzContentComponent, NzLayoutComponent, NzSiderComponent} from 'ng-zorro-antd/layout';
import {NzMenuDirective, NzMenuDividerDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {MainService} from '../../../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {CreateServicePropertiesComponent} from './properties/create.service.properties.component';
import {CreateServiceActionsComponent} from './actions/create.service.actions.component';
import {CreateServiceEventsComponent} from './events/create.service.events.component';
import {NzFlexModule} from 'ng-zorro-antd/flex';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../service/i18n.service';
import {ServiceOption} from './ServiceOption';
import {DescriptionComponent} from '../../../../form/item/common/description/description.component';

@Component({
  selector: 'create-service',
  styleUrl: './create.service.component.less',
  templateUrl: './create.service.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzColDirective,
    NzFormModule,
    NzRowDirective,
    DeviceInstanceIdComponent,
    DeviceInstanceNamespaceComponent,
    DeviceInstanceNameComponent,
    NzSpaceModule,
    NzContentComponent,
    NzLayoutComponent,
    NzSiderComponent,
    NzMenuDirective,
    NzMenuItemComponent,
    NzMenuDividerDirective,
    NzSpinModule,
    NzFlexModule,
    CreateServicePropertiesComponent,
    CreateServiceActionsComponent,
    CreateServiceEventsComponent,
    TranslatePipe,
    DescriptionComponent,
  ],
  providers: [],
})
export class CreateServiceComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;
  protected loadingServices = signal(false);

  readonly #modal: NzModalRef<Service, Service> = inject(NzModalRef);
  readonly option: ServiceOption = inject(NZ_MODAL_DATA);

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    requiredProperties: FormControl<Property[]>;
    optionalProperties: FormControl<Property[]>;
    requiredActions: FormControl<Action[]>;
    optionalActions: FormControl<Action[]>;
    requiredEvents: FormControl<Event[]>;
    optionalEvents: FormControl<Event[]>;
  }>;

  custom: Service;
  services = signal<Service[]>([]);
  selected: Service;

  definitions: ServiceDefinition[] = [];

  loadingProperties = signal(true);
  properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingActions = signal(true);
  actions: Map<string, ActionDefinition> = new Map<string, ActionDefinition>();

  loadingEvents = signal(true);
  events: Map<string, EventDefinition> = new Map<string, EventDefinition>();

  constructor(
    public i18n: MainI18nService,
    private service: MainService,
    private msg: NzMessageService,
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      requiredProperties: this.fb.control<Property[]>([]),
      optionalProperties: this.fb.control<Property[]>([]),
      requiredActions: this.fb.control<Action[]>([]),
      optionalActions: this.fb.control<Action[]>([]),
      requiredEvents: this.fb.control<Event[]>([]),
      optionalEvents: this.fb.control<Event[]>([]),
    });

    this.custom = this.createCustomService();
    this.selected = this.custom;
  }

  private createCustomService(): Service {
    const org = this.option.type.organization || 'org';
    const model = this.option.type.model || 'model';
    const version = this.option.type.version || 0;
    const type = new ServiceType(`urn:${org}:service:unnamed:00000000:${org}:${model}:${version}`);
    const description = new Map<string, string>();
    description.set(this.i18n.getCurrentLang(), this.i18n.translate.instant('自定义服务'));
    return new Service(this.option.iid, type, description, [], [], []);
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadProperties();
    this.loadActions();
    this.loadEvents();
  }

  private loadServices(): void {
    this.loadingServices.set(true);
    this.service.getServiceDefinitions(this.option.type.ns)
      .subscribe({
        next: data => {
          this.definitions = data;
          this.services.set(this.definitions
            .filter(x => x.lifecycle === LifeCycle.RELEASED)
            .map(x => {
              return new Service(this.option.iid, x.type, x.description, [], [], []);
            }));

          this.loadingServices.set(false);

          this.initFormData();
        },
        error: error => {
          this.msg.warning(error);
          this.loadingServices.set(false);
        }
      })
  }

  private loadProperties(): void {
    this.loadingProperties.set(true);
    this.service.getPropertyDefinitions(this.option.type.ns)
      .subscribe({
        next: data => {
          this.properties = new Map(data.map(item => [item.type.name, item]));
          this.loadingProperties.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loadingProperties.set(false);
        }
      })
  }

  private loadActions(): void {
    this.loadingActions.set(true);
    this.service.getActionDefinitions(this.option.type.ns)
      .subscribe({
        next: data => {
          this.actions = new Map(data.map(item => [item.type.name, item]));
          this.loadingActions.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loadingActions.set(false);
        }
      })
  }

  private loadEvents(): void {
    this.loadingEvents.set(true);
    this.service.getEventDefinitions(this.option.type.ns)
      .subscribe({
        next: data => {
          this.events = new Map(data.map(item => [item.type.name, item]));
          this.loadingEvents.set(false);
          this.initFormData();
        },
        error: error => {
          this.msg.warning(error);
          this.loadingEvents.set(false);
        }
      })
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.selected.iid = this.form.controls.iid.value;
    this.selected.type.ns = this.form.controls.ns.value;
    this.selected.type.name = this.form.controls.code.value;
    this.selected.description = this.form.controls.description.value;

    // --------------------------------------------------------
    // 构造属性列表
    // todo: 组合属性还需要完善
    // --------------------------------------------------------

    let piid = 1;

    for (let property of this.form.controls.requiredProperties.value) {
      property.iid = piid;
      this.selected.properties.set(property.iid, property);
      piid ++;
    }

    for (let property of this.form.controls.optionalProperties.value) {
      if (property.type._checked) {
        property.iid = piid;
        this.selected.properties.set(property.iid, property);
        piid ++;
      }
    }

    // --------------------------------------------------------
    // 构造方法列表
    // todo: 参数还需要完善
    // --------------------------------------------------------

    let aiid = 1;

    for (let action of this.form.controls.requiredActions.value) {
      action.iid = aiid;
      this.selected.actions.set(action.iid, action);
      aiid ++;
    }

    for (let action of this.form.controls.optionalActions.value) {
      if (action.type._checked) {
        action.iid = aiid;
        this.selected.actions.set(action.iid, action);
        aiid ++;
      }
    }

    // --------------------------------------------------------
    // 构造事件列表
    // todo: 参数还需要完善
    // --------------------------------------------------------

    let eiid = 1;

    for (let event of this.form.controls.requiredEvents.value) {
      event.iid = eiid;
      this.selected.events.set(event.iid, event);
      eiid ++;
    }

    for (let event of this.form.controls.requiredEvents.value) {
      if (event.type._checked) {
        event.iid = eiid;
        this.selected.events.set(event.iid, event);
        eiid ++;
      }
    }

    this.#modal.destroy(this.selected);
  }

  private initFormData() {
    this.loadingServices.set(true);

    const description: Map<string, string> = new Map<string, string>();
    description.set(this.i18n.getCurrentLang(), this.selected.description.get(this.i18n.getCurrentLang()) || '');

    this.form.controls.iid.setValue(this.selected.iid);
    this.form.controls.ns.setValue(this.selected.type.ns);
    this.form.controls.code.setValue(this.selected.type.name);
    this.form.controls.description.setValue(description);

    const def = this.definitions.find(x => x.type.name === this.selected.type.name);
    if (def) {
      // requiredProperties
      const requiredProperties: Property[] = def.requiredProperties.map(x => this.toProperty(x));
      for (let i = 0; i < requiredProperties.length; i++) {
        requiredProperties[i].iid = i + 1;
      }

      this.form.controls.requiredProperties.setValue(requiredProperties);
      this.form.controls.requiredProperties.disable();

      // optionalProperties
      const optionalProperties: Property[] = def.optionalProperties.map(x => this.toProperty(x));
      for (let i = 0; i < optionalProperties.length; i++) {
        optionalProperties[i].iid = i + 1;
      }

      this.form.controls.optionalProperties.setValue(optionalProperties);
      this.form.controls.optionalProperties.enable();

      // requiredActions
      const requiredActions: Action[] = def.requiredActions.map(x => this.toAction(x));
      for (let i = 0; i < requiredActions.length; i++) {
        requiredActions[i].iid = i + 1;
      }

      this.form.controls.requiredActions.setValue(requiredActions);
      this.form.controls.requiredActions.disable();

      // optionalActions
      const optionalActions: Action[] = def.optionalActions.map(x => this.toAction(x));
      for (let i = 0; i < optionalActions.length; i++) {
        optionalActions[i].iid = i + 1;
      }

      this.form.controls.optionalActions.setValue(optionalActions);
      this.form.controls.optionalActions.enable();

      // requiredEvents
      const requiredEvents: Event[] = def.requiredEvents.map(x => this.toEvent(x));
      for (let i = 0; i < requiredEvents.length; i++) {
        requiredEvents[i].iid = i + 1;
      }

      this.form.controls.requiredEvents.setValue(requiredEvents);
      this.form.controls.requiredEvents.disable();

      // optionalEvents
      const optionalEvents: Event[] = def.optionalEvents.map(x => this.toEvent(x));
      for (let i = 0; i < optionalEvents.length; i++) {
        optionalEvents[i].iid = i + 1;
      }

      this.form.controls.optionalEvents.setValue(optionalEvents);
      this.form.controls.optionalEvents.enable();
    }

    this.loadingServices.set(false);
  }

  private toProperty(type: PropertyType): Property {
    const def = this.properties.get(type.name);
    if (def) {
      return new Property(
        0,
        type,
        def.description,
        def.format,
        def.access,
        def.constraintValue,
        def.unit,
      );
    } else {
      console.log('not found: ', type.toString());

      const description = new Map<string, string>();
      description.set(this.i18n.getCurrentLang(), 'not found: ' + type.name);

      return new Property(
        0,
        type,
        description,
        DataFormat.BOOL,
        Access.of(false, false, false),
        null,
        null
      );
    }
  }

  private toAction(type: ActionType): Action {
    const def = this.actions.get(type.name);
    if (def) {
      return new Action(
        0,
        type,
        def.description,
        [],
        []
      );
    } else {
      console.log('not found: ', type.toString());

      const description = new Map<string, string>();
      description.set(this.i18n.getCurrentLang(), 'not found: ' + type.name);

      return new Action(
        0,
        type,
        description,
        [],
        []
      );
    }
  }

  private toEvent(type: EventType): Event {
    const def = this.events.get(type.name);
    if (def) {
      return new Event(
        0,
        type,
        def.description,
        []
      );
    } else {
      console.log('not found: ', type.toString());

      const description = new Map<string, string>();
      description.set(this.i18n.getCurrentLang(), 'not found: ' + type.name);

      return new Event(
        0,
        type,
        description,
        []
      );
    }
  }

  protected onClickService(s: Service) {
    this.selected = s;
    this.initFormData();
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');
  }

  protected onRequiredPropertiesChanged() {
    console.log('onRequiredPropertiesChanged');
  }

  protected onOptionalPropertiesChanged() {
    console.log('onOptionalPropertiesChanged');
  }

  protected onRequiredActionsChanged() {
    console.log('onRequiredActionsChanged');
  }

  protected onOptionalActionsChanged() {
    console.log('onOptionalActionsChanged');
  }

  protected onRequiredEventsChanged() {
    console.log('onRequiredEventsChanged');
  }

  protected onOptionalEventsChanged() {
    console.log('onOptionalEventsChanged');
  }
}
