import {SpecDevice} from '../../define/spec/SpecDevice';
import {DescriptionCodec} from '@openxiot/xiot-core-spec-ts';

export class SpecDeviceCodec {
  static encode(x: SpecDevice): any {
    return {
      namespace: x.namespace,
      name: x.name,
      uuid: x.uuid,
      type: x.type,
      description: x.description,
      lifecycle: x.lifecycle
    }
  }

  static decode(x: any): SpecDevice {
    const device = new SpecDevice();
    device.namespace = x.namespace;
    device.name = x.name;
    device.uuid = x.uuid;
    device.type = x.type;
    device.description = DescriptionCodec.decode(x.description);
    device.lifecycle = x.lifecycle;
    return device;
  }

  static decodeArray(arr: any[]): SpecDevice[] {
    const list: SpecDevice[] = [];
    if (arr != null) {
      for (const o of arr) {
        list.push(this.decode(o));
      }
    }
    return list;
  }

  static encodeArray(x: SpecDevice[]): any[] {
    const arr: any[] = [];
    if (x?.length) {
      for (const p of x) {
        arr.push(this.encode(p));
      }
    }
    return arr;
  }
}
