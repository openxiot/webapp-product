import {ServiceType} from '@openxiot/xiot-core-spec-ts';

export class PropertyOption {

  constructor(
    public type: ServiceType,
    public iid: number,
  ) {
  }
}
