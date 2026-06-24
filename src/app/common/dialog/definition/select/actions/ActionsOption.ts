import {ActionDefinition} from '@openxiot/xiot-core-spec-ts';

export class ActionsOption {

  constructor(
    public actions: ActionDefinition[] = [],
    public exclusion: Set<string> = new Set<string>(),
  ) {
  }
}
