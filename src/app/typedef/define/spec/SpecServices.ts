import {ObjectWithLifecycle, ServiceDefinition} from '@openxiot/xiot-core-spec-ts';

export class SpecServices {
  total: number = 0;
  services: ObjectWithLifecycle<ServiceDefinition>[] = [];
}
