import {PropertyDefinitionCodec} from '@openxiot/xiot-core-spec-ts';
import {SpecProperties} from '../../define/spec/SpecProperties';

export class SpecPropertiesCodec {

  static decode(x: any): SpecProperties {
    const spec = new SpecProperties();
    spec.total = x.total;
    spec.properties = PropertyDefinitionCodec.decodeArray(x.datalist);
    return spec;
  }
}
