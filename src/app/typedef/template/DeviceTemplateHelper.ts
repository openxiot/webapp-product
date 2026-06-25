import {
  ActionDefinition,
  DeviceTemplate,
  EventDefinition,
  PropertyDefinition,
  ServiceDefinition,
  ServiceTemplate,
  ServiceType
} from '@openxiot/xiot-core-spec-ts';
import {ServiceTemplateHelper} from './ServiceTemplateHelper';

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

    const helper = new ServiceTemplateHelper(service, this.properties, this.actions, this.events);

    this.addProperties(helper, def, version);
    this.addActions(helper, def, version);
    this.addEvents(helper, def, version);

    this.device.services.set(iid, service);
  }

  private addProperties(helper: ServiceTemplateHelper, def: ServiceDefinition, version: number) {
    let iid = 1;

    for (let type of def.requiredProperties) {
      const property = this.properties.get(type.name);
      if (property) {
        if (helper.addProperty(iid, property, true, version)) {
          iid++;
        } else {
          console.error('addProperty failed');
        }
      } else {
        console.error('property definition not found: ' + type.toString());
      }
    }

    for (let type of def.optionalProperties) {
      const property = this.properties.get(type.name);
      if (property) {
        if (helper.addProperty(iid, property, false, version)) {
          iid++;
        } else {
          console.error('addProperty failed');
        }
      } else {
        console.error('property definition not found: ' + type.toString());
      }
    }
  }

  private addActions(helper: ServiceTemplateHelper, def: ServiceDefinition, version: number) {
    let iid = 1;

    for (let type of def.requiredActions) {
      const action = this.actions.get(type.name);
      if (action) {
        if (helper.addAction(iid, action, true, version)) {
          iid++;
        } else {
          console.error('addAction failed');
        }
      } else {
        console.error('action definition not found: ' + type.toString());
      }
    }

    for (let type of def.optionalActions) {
      const action = this.actions.get(type.name);
      if (action) {
        if (helper.addAction(iid, action, false, version)) {
          iid++;
        } else {
          console.error('addAction failed');
        }
      } else {
        console.error('action definition not found: ' + type.toString());
      }
    }
  }

  private addEvents(helper: ServiceTemplateHelper, def: ServiceDefinition, version: number) {
    let iid = 1;

    for (let type of def.optionalEvents) {
      const event = this.events.get(type.name);
      if (event) {
        if (helper.addEvent(iid, event, true, version)) {
          iid++;
        } else {
          console.error('addEvent failed');
        }
      } else {
        console.error('event definition not found: ' + type.toString());
      }
    }

    for (let type of def.optionalEvents) {
      const event = this.events.get(type.name);
      if (event) {
        if (helper.addEvent(iid, event, false, version)) {
          iid++;
        } else {
          console.error('addEvent failed');
        }
      } else {
        console.error('event definition not found: ' + type.toString());
      }
    }
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
