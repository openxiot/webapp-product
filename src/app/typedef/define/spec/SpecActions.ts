import {ObjectWithLifecycle, ActionDefinition} from '@openxiot/xiot-core-spec-ts';

export class SpecActions {
  total: number = 0;
  actions: ObjectWithLifecycle<ActionDefinition>[] = [];
}
