import {EventDefinition} from '@openxiot/xiot-core-spec-ts';

export class EventDefinitionSelector {

  constructor(
    public events: EventDefinition[],
    public exclusion: Set<string>,
    public language: string,
  ) {
  }
}
