import {PropertyDefinition} from '@openxiot/xiot-core-spec-ts';

export class DefinitionSelectMember {

  constructor(
    public properties: PropertyDefinition[],
    public members: PropertyDefinition[],
    public language: string,
  ) {
  }
}
