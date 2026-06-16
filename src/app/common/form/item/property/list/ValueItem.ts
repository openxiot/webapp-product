import {ValueDefinition} from '@openxiot/xiot-core-spec-ts';

export class ValueItem {

  constructor(
    public value: number = 0,
    public desc: Map<string, string> = new Map<string, string>(),
  ) {
  }

  static of(v: ValueDefinition): ValueItem {
    return new ValueItem(v.value.rawValue() || 0, v.description)
  }
}
