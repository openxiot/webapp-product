import {ServiceType} from '@openxiot/xiot-core-spec-ts';

export class ActionOption {

  constructor(
    public type: ServiceType,
    public iid: number,
  ) {
  }
}
