import {ServiceType} from '@openxiot/xiot-core-spec-ts';

export class EventOption {

  constructor(
    public type: ServiceType,
    public iid: number,
  ) {
  }
}
