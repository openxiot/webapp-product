import {ObjectWithLifecycle, EventDefinition} from '@openxiot/xiot-core-spec-ts';

export class SpecEvents {
  total: number = 0;
  events: ObjectWithLifecycle<EventDefinition>[] = [];
}
