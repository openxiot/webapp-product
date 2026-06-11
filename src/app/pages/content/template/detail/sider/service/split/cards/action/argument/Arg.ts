import {Argument, Property} from '@openxiot/xiot-core-spec-ts';

export class Arg {
  constructor(
    public argument: Argument,
    public property: Property,
    public language: string,
  ) {
  }
}
