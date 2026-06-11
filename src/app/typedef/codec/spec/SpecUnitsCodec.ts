import {UnitDefinitionWithLifecycleCodec} from '@openxiot/xiot-core-spec-ts';
import {SpecUnits} from '../../define/spec/SpecUnits';

export class SpecUnitsCodec {

  static decode(x: any): SpecUnits {
    const spec = new SpecUnits();
    spec.total = x.total;
    spec.units = UnitDefinitionWithLifecycleCodec.decodeArray(x.datalist);
    return spec;
  }
}
