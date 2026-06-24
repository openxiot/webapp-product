import {ServiceDefinition} from '@openxiot/xiot-core-spec-ts';

export class ServicesOption {

  constructor(
    public services: ServiceDefinition[] = [],
    public exclusion: Set<string> = new Set<string>(),
  ) {
  }
}
