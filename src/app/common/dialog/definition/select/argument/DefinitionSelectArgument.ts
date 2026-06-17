import {PropertyDefinition} from '@openxiot/xiot-core-spec-ts';

export class DefinitionSelectArgument {

  constructor(
    public properties: PropertyDefinition[],
    public exclusion: Set<string>,
    public language: string,
  ) {
  }
}
