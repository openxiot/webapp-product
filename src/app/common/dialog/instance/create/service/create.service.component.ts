import {Component, inject, OnInit} from '@angular/core';
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
import {DeviceInstanceIdComponent} from '../../../../device/instance/service/split/detail/property/iid/device.instance.id.component';
import {
  Access,
  LifeCycle,
  ObjectWithLifecycle,
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
  DataFormat,
} from '@openxiot/xiot-core-spec-ts';
import {DeviceInstanceNamespaceComponent} from '../../../../device/instance/service/split/detail/property/namespace/device.instance.namespace.component';
import {DeviceInstanceDescriptionComponent} from '../../../../device/instance/service/split/detail/property/description/device.instance.description.component';
import {DeviceInstanceNameComponent} from '../../../../device/instance/service/split/detail/property/name/device.instance.name.component';
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
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'create-service',
  styleUrls: ['./create.service.component.less'],
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
    DeviceInstanceDescriptionComponent,
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
  ],
  providers: [],
})
export class CreateServiceComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;
  protected loadingServices: boolean = false;

  readonly #modal: NzModalRef<Service, Service> = inject(NzModalRef);
  readonly data: Service = inject(NZ_MODAL_DATA);

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

  services: Service[] = [];
  current: Service;

  definitions: ServiceDefinition[] = [];

  loadingProperties: boolean = true;
  properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingActions: boolean = true;
  actions: Map<string, ActionDefinition> = new Map<string, ActionDefinition>();

  loadingEvents: boolean = true;
  events: Map<string, EventDefinition> = new Map<string, EventDefinition>();

  constructor(
    private account: AccountService,
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

    this.current = this.data;
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadProperties();
    this.loadActions();
    this.loadEvents();
  }

  private loadServices(): void {
    this.loadingServices = true;
    this.service.getServiceDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.definitions = data;
          this.services = this.definitions
            .filter(x => x.lifecycle === LifeCycle.RELEASED)
            .map(x => {
              return new Service(this.data.iid, x.type, x.description, [], [], []);
            });

          this.loadingServices = false;

          this.initFormData();
        },
        error: error => {
          this.msg.warning('Failed to getSpecServices: ', error);
        }
      })
  }

  private loadProperties(): void {
    this.loadingProperties = true;
    this.service.getPropertyDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.properties = new Map(data.map(item => [item.type.name, item]));
          this.loadingProperties = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecProperties: ', error);
        }
      })
  }

  private loadActions(): void {
    this.loadingActions = true;
    this.service.getActionDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.actions = new Map(data.map(item => [item.type.name, item]));
          this.loadingActions = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecActions: ', error);
        }
      })
  }

  private loadEvents(): void {
    this.loadingEvents = true;
    this.service.getEventDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.events = new Map(data.map(item => [item.type.name, item]));
          this.loadingEvents = false;
          this.initFormData();
        },
        error: error => {
          this.msg.warning('Failed to getSpecEvents: ', error);
        }
      })
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.data.iid = this.form.controls.iid.value;
    this.data.type.ns = this.form.controls.ns.value;
    this.data.type.value = this.current.type.value;
    this.data.type.name = this.form.controls.code.value;
    this.data.description = this.form.controls.description.value;

    // --------------------------------------------------------
    // 构造属性列表
    // todo: 组合属性还需要完善
    // --------------------------------------------------------

    let piid = 1;

    for (let property of this.form.controls.requiredProperties.value) {
      property.iid = piid;
      this.data.properties.set(property.iid, property);
      piid ++;
    }

    for (let property of this.form.controls.optionalProperties.value) {
      if (property.type._checked) {
        property.iid = piid;
        this.data.properties.set(property.iid, property);
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
      this.data.actions.set(action.iid, action);
      aiid ++;
    }

    for (let action of this.form.controls.optionalActions.value) {
      if (action.type._checked) {
        action.iid = aiid;
        this.data.actions.set(action.iid, action);
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
      this.data.events.set(event.iid, event);
      eiid ++;
    }

    for (let event of this.form.controls.requiredEvents.value) {
      if (event.type._checked) {
        event.iid = eiid;
        this.data.events.set(event.iid, event);
        eiid ++;
      }
    }

    this.#modal.destroy(this.data);
  }

  private initFormData() {
    this.loadingServices = true;
    this.form.controls.iid.setValue(this.data.iid);
    this.form.controls.ns.setValue(this.data.type.ns);
    this.form.controls.code.setValue(this.data.type.name);
    this.form.controls.description.setValue(this.data.description);
    this.loadingServices = false;
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
      description.set('zh-CN', '没有找到: ' + type.name);

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
      description.set('zh-CN', '没有找到: ' + type.name);

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
      description.set('zh-CN', '没有找到: ' +  + type.name);

      return new Event(
        0,
        type,
        description,
        []
      );
    }
  }

  protected onClickService(s: Service) {
    this.loadingServices = true;
    this.current = s;

    this.form.controls.iid.setValue(s.iid);
    this.form.controls.ns.setValue(s.type.ns);
    this.form.controls.code.setValue(s.type.name);
    this.form.controls.description.setValue(s.description);

    const def = this.definitions.find(x => x.type.name === s.type.name);
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

    this.loadingServices = false;
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
