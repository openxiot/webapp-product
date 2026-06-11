import {ObjectWithLifecycle, PropertyDefinition} from '@openxiot/xiot-core-spec-ts';

export class SpecProperties {
  total: number = 0;
  properties: ObjectWithLifecycle<PropertyDefinition>[] = [];
}
