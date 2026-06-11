import {DescriptionCodec, DeviceType, LifeCycleFromString} from '@openxiot/xiot-core-spec-ts';
import {Template} from '../../define/template/Template';

export class TemplateCodec {
  static encode(x: Template): any {
    return {
      type: x.type.toString(),
      description: DescriptionCodec.encode(x.description),
      lifecycle: x.lifecycle,
    }
  }

  static decode(x: any): Template {
    return new Template(
      DeviceType.parse(x.type),
      DescriptionCodec.decode(x.description),
      LifeCycleFromString(x.lifecycle)
    );
  }

  static decodeArray(arr: any[]): Template[] {
    const list: Template[] = [];
    if (arr != null) {
      for (const o of arr) {
        list.push(this.decode(o));
      }
    }
    return list;
  }

  static encodeArray(x: Template[]): any[] {
    const arr: any[] = [];
    if (x?.length) {
      for (const p of x) {
        arr.push(this.encode(p));
      }
    }
    return arr;
  }
}
