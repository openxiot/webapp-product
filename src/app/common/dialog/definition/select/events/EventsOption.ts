import {EventDefinition} from '@openxiot/xiot-core-spec-ts';

export class EventsOption {

  constructor(
    public events: EventDefinition[] = [],
    public exclusion: Set<string> = new Set<string>(),
  ) {
  }
}
