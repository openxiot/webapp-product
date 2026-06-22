import {ActionDefinition} from '@openxiot/xiot-core-spec-ts';

export class ActionDefinitionSelector {

  constructor(
    public actions: ActionDefinition[],
    public exclusion: Set<string>,
  ) {
  }
}
