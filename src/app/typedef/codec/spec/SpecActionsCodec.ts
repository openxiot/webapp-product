import {ActionDefinitionWithLifecycleCodec} from '@openxiot/xiot-core-spec-ts';
import {SpecActions} from '../../define/spec/SpecActions';

export class SpecActionsCodec {

  static decode(x: any): SpecActions {
    const spec = new SpecActions();
    spec.total = x.total;
    spec.actions = ActionDefinitionWithLifecycleCodec.decodeArray(x.datalist);
    return spec;
  }
}
