import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef} from '@angular/core';
import {
  ActionDefinition,
  ActionTemplate,
  ActionType, Argument,
  DeviceTemplate, EventDefinition, EventTemplate,
  EventType, PropertyDefinition, PropertyTemplate,
  PropertyType,
  ServiceDefinition,
  ServiceTemplate, ServiceType
} from '@openxiot/xiot-core-spec-ts';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../../service/i18n.service';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {
  ServicesDefinitionSelectorComponent
} from '../../../../../../common/dialog/definition/select/services/services.definition.selector.component';
import {ServicesOption} from '../../../../../../common/dialog/definition/select/services/ServicesOption';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {MainService} from '../../../../../../service/main.service';
import {AccountService} from '../../../../../../service/account.service';

@Component({
  selector: 'template-detail-services',
  templateUrl: './template.detail.services.component.html',
  styleUrls: ['./template.detail.services.component.less'],
  standalone: true,
  imports: [
    TranslatePipe,
    NzTagComponent,
    NzMenuModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzDropDownModule,
    NzButtonModule,
    NzSpinModule,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateDetailServicesComponent implements OnInit {

  @Input() showVersion: boolean = false;
  @Input() editable: boolean = false;
  @Input() device: DeviceTemplate | undefined = undefined;
  @Output() selected = new EventEmitter<ServiceTemplate>();
  @Output() changed = new EventEmitter<void>();

  loading: boolean = false;
  services: ServiceDefinition[] = [];

  loadingProperties: boolean = true;
  properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingActions: boolean = true;
  actions: Map<string, ActionDefinition> = new Map<string, ActionDefinition>();

  loadingEvents: boolean = true;
  events: Map<string, EventDefinition> = new Map<string, EventDefinition>();

  constructor(
    public i18n: MainI18nService,
    private modal: NzModalService,
    private account: AccountService,
    private viewContainerRef: ViewContainerRef,
    private main: MainService,
    private msg: NzMessageService
  ) {
  }

  ngOnInit(): void {
    this.loadDefinitions();
  }

  private loadDefinitions(): void {
    this.loading = true;
    this.main.getServiceDefinitions(this.account.ns.namespace).subscribe({
      next: data => {
        this.services = data;
        this.loading = false;
      },
      error: error => {
        this.msg.warning(error);
      }
    });

    this.loadingProperties = true;
    this.main.getPropertyDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.properties = new Map(data.map(item => [item.type.name, item]));
          this.loadingProperties = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      });

    this.loadingActions = true;
    this.main.getActionDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.actions = new Map(data.map(item => [item.type.name, item]));
          this.loadingActions = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      });

    this.loadingEvents = true;
    this.main.getEventDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.events = new Map(data.map(item => [item.type.name, item]));
          this.loadingEvents = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      });
  }

  onClickService(s: ServiceTemplate) {
    this.selected.emit(s);
  }

  onAddService() {
    const modal = this.modal.create<ServicesDefinitionSelectorComponent, ServicesOption, ServiceDefinition[]>({
      nzTitle: this.i18n.translate.instant('添加服务'),
      nzWidth: 800,
      nzContent: ServicesDefinitionSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new ServicesOption(this.services),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: false,
          type: 'primary',
          disabled: component => component!.disabled || false,
          onClick: component => component!.ok()
        }
      ],
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        if (result.length > 0) {
          this.addServiceDefinitions(result, this.device?.type?.version || 1);
          this.changed.emit();
        }
      }
    });
  }

  protected addServiceDefinitions(defs: ServiceDefinition[], version: number) {
    defs.forEach(def => this.addService(def, version));
  }

  private addService(def: ServiceDefinition, version: number): void {
    console.log('addService: ' + def.type.toString());

    const iid = this.getMaxServiceIID() + 1;
    const required: boolean = false;
    const vendor: string = this.device?.type.organization || "null";
    const model: string = this.device?.type.model || "null";
    const type = new ServiceType(def.type.toString() + ":" + vendor + ":" + model + ":" + version);
    const description = def.description;
    const propertyAddable: boolean = false;
    const actionAddable: boolean = false;
    const eventAddable: boolean = false;
    const source: string = ''; //  todo：这TM个是啥？

    const service = new ServiceTemplate(iid, required, type, description, [], [], [],
      propertyAddable,
      actionAddable,
      eventAddable,
      source
    );

    this.addProperties(service, def, version);
    this.addActions(service, def, version);
    this.addEvents(service, def, version);

    this.device?.services.set(iid, service);
  }

  private addProperties(service: ServiceTemplate, def: ServiceDefinition, version: number) {
    let iid = 1;

    for (let type of def.requiredProperties) {
      if (this.addProperty(service, iid, type, true, version)) {
        iid++;
      } else {
        console.error('addProperty failed');
      }
    }

    for (let type of def.optionalProperties) {
      if (this.addProperty(service, iid, type, false, version)) {
        iid++;
      } else {
        console.error('addProperty failed');
      }
    }
  }

  private addActions(service: ServiceTemplate, def: ServiceDefinition, version: number) {
    let iid = 1;

    for (let type of def.requiredActions) {
      if (this.addAction(service, iid, type, true, version)) {
        iid++;
      } else {
        console.error('action definition not found');
      }
    }

    for (let type of def.optionalActions) {
      if (this.addAction(service, iid, type, false, version)) {
        iid++;
      } else {
        console.error('action definition not found');
      }
    }
  }

  private addEvents(service: ServiceTemplate, def: ServiceDefinition, version: number) {
    let iid = 1;

    for (let type of def.optionalEvents) {
      if (this.addEvent(service, iid, type, true, version)) {
        iid++;
      } else {
        console.error('action definition not found');
      }
    }

    for (let type of def.optionalEvents) {
      if (this.addEvent(service, iid, type, false, version)) {
        iid++;
      } else {
        console.error('action definition not found');
      }
    }
  }

  private addProperty(service: ServiceTemplate, iid: number, type: PropertyType, required: boolean, version: number): boolean {
    const def = this.properties.get(type.name);
    if (def == null) {
      return false;
    }

    const vendor: string = this.device?.type.organization || "null";
    const model: string = this.device?.type.model || "null";
    const t = new PropertyType(def.type.toString() + ":" + vendor + ":" + model + ":" + version);
    const description = def.description;
    const source: string = ''; //  todo：这TM个是啥？

    // todo: 组合属性待完成

    // members: Array<number> | undefined, required: boolean, source: string
    const property =  new PropertyTemplate(
      iid,
      t,
      description,
      def.format,
      def.access,
      def.constraintValue,
      def.unit,
      [],
      required,
      source,
    );

    service.properties.set(iid, property);

    return true;
  }

  private addAction(service: ServiceTemplate, iid: number, type: ActionType, required: boolean, version: number): boolean {
    const def = this.actions.get(type.name);
    if (def == null) {
      return false;
    }

    const vendor: string = this.device?.type.organization || "null";
    const model: string = this.device?.type.model || "null";
    const t = new ActionType(def.type.toString() + ":" + vendor + ":" + model + ":" + version);
    const description = def.description;
    const source: string = ''; //  todo：这TM个是啥？
    const argumentsIn: Argument[] = [];
    const argumentsOut: Argument[] = [];

    // todo: 参数依赖属性，待添加。

    const action = new ActionTemplate(
      iid,
      required,
      t,
      description,
      argumentsIn,
      argumentsOut,
      source,
    );

    service.actions.set(iid, action);

    return true;
  }

  private addEvent(service: ServiceTemplate, iid: number, type: EventType, required: boolean, version: number): boolean {
    const def = this.events.get(type.name);
    if (def == null) {
      return false;
    }

    const vendor: string = this.device?.type.organization || "null";
    const model: string = this.device?.type.model || "null";
    const t = new EventType(def.type.toString() + ":" + vendor + ":" + model + ":" + version);
    const description = def.description;
    const source: string = ''; //  todo：这TM个是啥？
    const args: Argument[] = [];

    // todo: 参数依赖属性，待添加。

    const event = new EventTemplate(
      iid,
      required,
      t,
      description,
      args,
      source,
    );

    service.events.set(iid, event);

    return true;
  }

  private getMaxServiceIID() {
    let iid: number = 1;

    if (this.device) {
      for (let service of this.device.getServices()) {
        if (service.iid > iid) {
          iid = service.iid;
        }
      }
    }

    return iid;
  }
}
