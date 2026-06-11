import {ServiceDefinitionWithLifecycleCodec} from '@openxiot/xiot-core-spec-ts';
import {SpecServices} from '../../define/spec/SpecServices';

export class SpecServicesCodec {

  static decode(x: any): SpecServices {
    const spec = new SpecServices();
    spec.total = x.total;
    spec.services = ServiceDefinitionWithLifecycleCodec.decodeArray(x.datalist);
    return spec;
  }
}
