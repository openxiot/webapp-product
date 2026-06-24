import {PropertyDefinition} from '@openxiot/xiot-core-spec-ts';

export class PropertiesOption {

  constructor(
    public properties: PropertyDefinition[] = [],
    public exclusion: Set<string> = new Set<string>(),
  ) {
  }
}
