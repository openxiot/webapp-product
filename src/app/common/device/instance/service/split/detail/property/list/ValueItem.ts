import {ValueDefinition} from '@openxiot/xiot-core-spec-ts/dist/xiot/core/spec/typedef/definition/property/ValueDefinition';

export class ValueItem {

  constructor(
    public value: number = 0,
    public descriptionZH: string = '',
    public descriptionEN: string = '',
  ) {
  }

  static of(v: ValueDefinition): ValueItem {
    return new ValueItem(
      v.value.rawValue() || 0,
      v.description.get('zh-CN') || '',
      v.description.get('en-US') || ''
    )
  }
}

// 工厂函数
export function createValueItem(value: number = 0, descriptionZH: string = '', descriptionEN: string = ''): ValueItem {
  return new ValueItem(value, descriptionZH, descriptionEN);
}
