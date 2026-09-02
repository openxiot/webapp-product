import {Argument, Property} from '@openxiot/xiot-core-spec-ts';

/** 结构化放款：product 的 Service 与 template 的 ServiceTemplate 都满足（均提供 getProperties）。 */
export interface ServiceLike {
  getProperties(): Property[];
}

export class SelectArgument {

  constructor(
    public service: ServiceLike,
    public exclusion: Set<number>,
    public language: string,
  ) {
  }
}
