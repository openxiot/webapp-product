import {Service, Argument, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';

export class SelectArgument {

  constructor(
    public service: ServiceTemplate,
    public exclusion: Set<number>,
    public language: string,
  ) {
  }
}
