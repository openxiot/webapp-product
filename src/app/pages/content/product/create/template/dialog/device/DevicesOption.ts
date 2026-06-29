import {DeviceDefinition, TemplateSummary} from '@openxiot/xiot-core-spec-ts';

export class DevicesOption {
  constructor(
    public devices: DeviceDefinition[],
    public name: string,
  ) {
  }
}
