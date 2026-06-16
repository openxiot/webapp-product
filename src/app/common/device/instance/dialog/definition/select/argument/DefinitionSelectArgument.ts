import {Service, Argument} from '@openxiot/xiot-core-spec-ts';

export class DefinitionSelectArgument {

  constructor(
    public service: Service,
    public exclusion: Set<number>,
    public language: string,
  ) {
  }
}
