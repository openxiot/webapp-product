import {PropertyDefinition} from '@openxiot/xiot-core-spec-ts';

export class PropertyDefinitionSelector {

  constructor(
    public properties: PropertyDefinition[],
    public exclusion: Set<string>,
    public language: string,
  ) {
  }
}
