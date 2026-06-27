import {DeviceDefinition, TemplateSummary} from '@openxiot/xiot-core-spec-ts';

export class TemplatesOption {
  constructor(
    public devices: DeviceDefinition[],
    public templates: TemplateSummary[],
  ) {
  }
}
