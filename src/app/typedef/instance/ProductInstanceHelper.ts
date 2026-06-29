import {DeviceDefinition, DeviceInstance, DeviceTemplate, DeviceType} from '@openxiot/xiot-core-spec-ts';

export class ProductInstanceHelper {

  static fromTemplate(organization: string, model: string, template: DeviceTemplate): DeviceInstance {
    const type: DeviceType = new DeviceType(`urn:${template.type.ns}:device:${template.type.name}:${template.type.shortUUID()}:${organization}:${model}:1`);
    const instance = new DeviceInstance(type, template.description, []);


    return instance;
  }

  static fromDefinition(organization: string, model: string, data: DeviceDefinition): DeviceInstance {
    const t = `urn:${data.type.ns}:device:${data.type.name}:${data.type.shortUUID()}:${organization}:${model}:1`;
    const type: DeviceType = new DeviceType(t);
    return new DeviceInstance(type, data.description, []);
  }
}
