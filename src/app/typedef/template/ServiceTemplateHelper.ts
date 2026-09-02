import {
  ActionDefinition,
  ActionTemplate,
  ActionType,
  Argument,
  EventDefinition,
  EventTemplate,
  EventType,
  PropertyDefinition,
  PropertyTemplate,
  PropertyType,
  ServiceTemplate
} from '@openxiot/xiot-core-spec-ts';

export class ServiceTemplateHelper {

  constructor(
    public service: ServiceTemplate,
    public properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>(),
    public actions: Map<string, ActionDefinition> = new Map<string, ActionDefinition>(),
    public events: Map<string, EventDefinition> = new Map<string, EventDefinition>()
  ) {
  }

  public addPropertyDefinitions(defs: PropertyDefinition[], version: number) {
    let iid = this.getMaxPropertyIID() + 1;

    for (let def of defs) {
      if (this.addProperty(iid, def, true, version)) {
        iid++;
      } else {
        console.error('addProperty failed');
      }
    }
  }

  public addActionDefinitions(defs: ActionDefinition[], version: number) {
    let iid = this.getMaxActionIID() + 1;

    for (let def of defs) {
      if (this.addAction(iid, def, true, version)) {
        iid++;
      } else {
        console.error('addAction failed');
      }
    }
  }

  public addEventDefinitions(defs: EventDefinition[], version: number) {
    let iid = this.getMaxEventIID() + 1;

    for (let def of defs) {
      if (this.addEvent(iid, def, true, version)) {
        iid++;
      } else {
        console.error('addEvent failed');
      }
    }
  }

  public addProperty(iid: number, def: PropertyDefinition, required: boolean, version: number): boolean {
    const vendor: string = this.service?.type.organization || "null";
    const model: string = this.service?.type.model || "null";
    const t = new PropertyType(def.type.toString() + ":" + vendor + ":" + model + ":" + version);
    const description = def.description;
    const source: string = ''; //  todo：这TM个是啥？

    // todo: 组合属性待完成

    // members: Array<number> | undefined, required: boolean, source: string
    const property = new PropertyTemplate(
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

    this.service.properties.set(iid, property);

    return true;
  }

  private findProperty(type: PropertyType): PropertyTemplate | undefined {
    for (let property of this.service.getProperties()) {
      if (property.type.name === type.name) {
        return property;
      }
    }

    return undefined;
  }

  private addArgument(def: PropertyDefinition, required: boolean, version: number): number {
    const iid = this.getMaxPropertyIID() + 1;
    this.addProperty(iid, def, true, version);
    return iid;
  }

  public addAction(iid: number, def: ActionDefinition, required: boolean, version: number): boolean {
    const vendor: string = this.service.type.organization || "null";
    const model: string = this.service.type.model || "null";
    const t = new ActionType(def.type.toString() + ":" + vendor + ":" + model + ":" + version);
    const description = def.description;
    const source: string = ''; //  todo：这TM个是啥？
    const argumentsIn: Argument[] = [];
    const argumentsOut: Argument[] = [];

    for (let arg of def.in) {
      const found = this.findProperty(arg.type);
      if (found) {
        argumentsIn.push(Argument.of(found.iid, arg.minRepeat, arg.maxRepeat));
      } else {
        const p = this.properties.get(arg.type.name);
        if (p) {
          const iid = this.addArgument(p, true, version)
          argumentsIn.push(Argument.of(iid, arg.minRepeat, arg.maxRepeat));
        } else {
          console.log('error: property not found: ' + arg.type.toString())
        }
      }
    }

    for (let arg of def.out) {
      const found = this.findProperty(arg.type);
      if (found) {
        argumentsOut.push(Argument.of(found.iid, arg.minRepeat, arg.maxRepeat));
      } else {
        const p = this.properties.get(arg.type.name);
        if (p) {
          const iid = this.addArgument(p, true, version)
          argumentsOut.push(Argument.of(iid, arg.minRepeat, arg.maxRepeat));
        } else {
          console.log('error: property not found: ' + arg.type.toString())
        }
      }
    }

    const action = new ActionTemplate(
      iid,
      required,
      t,
      description,
      argumentsIn,
      argumentsOut,
      source,
    );

    this.service.actions.set(iid, action);

    return true;
  }

  public addEvent(iid: number, def: EventDefinition, required: boolean, version: number): boolean {
    const vendor: string = this.service.type.organization || "null";
    const model: string = this.service.type.model || "null";
    const t = new EventType(def.type.toString() + ":" + vendor + ":" + model + ":" + version);
    const description = def.description;
    const source: string = ''; //  todo：这TM个是啥？
    const args: Argument[] = [];

    for (let arg of def.arguments) {
      const found = this.findProperty(arg.type);
      if (found) {
        args.push(Argument.of(found.iid, arg.minRepeat, arg.maxRepeat));
      } else {
        const p = this.properties.get(arg.type.name);
        if (p) {
          const iid = this.addArgument(p, true, version)
          args.push(Argument.of(iid, arg.minRepeat, arg.maxRepeat));
        } else {
          console.log('error: property not found: ' + arg.type.toString())
        }
      }
    }

    const event = new EventTemplate(
      iid,
      required,
      t,
      description,
      args,
      source,
    );

    this.service.events.set(iid, event);

    return true;
  }

  private getMaxPropertyIID() {
    let iid: number = 1;

    for (let item of this.service.getProperties()) {
      if (item.iid > iid) {
        iid = item.iid;
      }
    }

    return iid;
  }

  private getMaxActionIID() {
    let iid: number = 1;

    for (let item of this.service.getActions()) {
      if (item.iid > iid) {
        iid = item.iid;
      }
    }

    return iid;
  }

  private getMaxEventIID() {
    let iid: number = 1;

    for (let item of this.service.getEvents()) {
      if (item.iid > iid) {
        iid = item.iid;
      }
    }

    return iid;
  }
}
