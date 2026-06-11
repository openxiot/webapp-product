import {DeviceInstance, ObjectWithLifecycle, Product} from '@openxiot/xiot-core-spec-ts';

export class JoyProductV1 {

  constructor(
    public product: Product,
    public instances: ObjectWithLifecycle<DeviceInstance>[]
  ) {
  }
}
