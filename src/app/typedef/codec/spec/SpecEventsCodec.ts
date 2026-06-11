import {EventDefinitionWithLifecycleCodec} from '@openxiot/xiot-core-spec-ts';
import {SpecEvents} from '../../define/spec/SpecEvents';

export class SpecEventsCodec {

  static decode(x: any): SpecEvents {
    const spec = new SpecEvents();
    spec.total = x.total;
    spec.events = EventDefinitionWithLifecycleCodec.decodeArray(x.datalist);
    return spec;
  }
}
