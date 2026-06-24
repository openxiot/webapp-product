import {
  ActionDefinition,
  ActionTemplate,
  ActionType, Argument,
  DeviceTemplate, EventDefinition, EventTemplate, EventType, PropertyDefinition, PropertyTemplate,
  PropertyType,
  ServiceDefinition,
  ServiceTemplate,
  ServiceType
} from '@openxiot/xiot-core-spec-ts';

export class DeviceTemplateHelper {

  constructor(
    public device: DeviceTemplate,
    public properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>(),
    public actions: Map<string, ActionDefinition> = new Map<string, ActionDefinition>(),
    public events: Map<string, EventDefinition> = new Map<string, EventDefinition>()
  ) {
  }

  public addServiceDefinitions(defs: ServiceDefinition[], version: number) {
    defs.forEach(def => this.addService(def, version));
  }

  private addService(def: ServiceDefinition, version: number): void {
    console.log('addService: ' + def.type.toString());

    const iid = this.getMaxServiceIID() + 1;
    const required: boolean = false;
    const vendor: string = this.device.type.organization || "null";
    const model: string = this.device.type.model || "null";
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

    this.device.services.set(iid, service);
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
