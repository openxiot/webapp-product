import {SpecTemplates} from '../../define/template/SpecTemplates';
import {TemplateCodec} from './TemplateCodec';

export class SpecTemplatesCodec {

  static decode(x: any): SpecTemplates {
    const spec = new SpecTemplates();
    spec.total = x.total;
    spec.templates = TemplateCodec.decodeArray(x.datalist);
    return spec;
  }
}
