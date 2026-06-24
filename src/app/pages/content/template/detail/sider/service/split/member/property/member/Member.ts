import {Property} from '@openxiot/xiot-core-spec-ts';

export class Member {
  constructor(
    public property: Property,
    public language: string,
  ) {
  }
}
