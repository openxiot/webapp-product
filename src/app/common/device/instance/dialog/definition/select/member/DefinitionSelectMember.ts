import {PropertyDefinition} from '@openxiot/xiot-core-spec-ts';

export class DefinitionSelectMember {

  constructor(
    public members: PropertyDefinition[],
    public language: string,
  ) {
  }
}
