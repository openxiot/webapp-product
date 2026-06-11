import {DeviceInstanceWithLifecycleCodec, ProductCodec} from '@openxiot/xiot-core-spec-ts';
import {JoyProductV1} from '../../define/product/JoyProductV1';

export class JoyProductV1Codec {

  static decode(x: any): JoyProductV1 {
    const product = ProductCodec.decode(x);
    const instances = DeviceInstanceWithLifecycleCodec.decodeArray(x.instances);
    return new JoyProductV1(product, instances);
  }
}
