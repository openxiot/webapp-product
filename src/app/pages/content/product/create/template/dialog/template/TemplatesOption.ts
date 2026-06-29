import {TemplateSummary, Urn} from '@openxiot/xiot-core-spec-ts';

export class TemplatesOption {
  constructor(
    public templates: TemplateSummary[],
    public deviceType: Urn,
    public model: string,
  ) {
  }
}
