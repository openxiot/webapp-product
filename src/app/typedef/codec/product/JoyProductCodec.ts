import {
  ProductBasicCodec,
  ProductFirmwareCodec,
  ProductInstanceCodec,
  ProductManualCodec,
  ProductPanelCodec,
  ProductWizardCodec
} from '@openxiot/xiot-core-spec-ts';
import {JoyProduct} from '../../define/product/JoyProduct';

export class JoyProductCodec {

  static decode(x: any): JoyProduct {
    const basic = ProductBasicCodec.decode(x.basic);
    const wizard = ProductWizardCodec.decode(x.wizard);
    const instances = ProductInstanceCodec.decodeArray(x.instances);
    const panels = ProductPanelCodec.decodeArray(x.panels);
    const firmwares = ProductFirmwareCodec.decodeArray(x.firmwares);
    const manual = ProductManualCodec.decode(x.manual);
    return new JoyProduct(basic, wizard, instances, panels, firmwares, manual);
  }

  static decodeArray(arr: any[]): JoyProduct[] {
    const list: JoyProduct[] = [];
    if (arr?.length) {
      for (const o of arr) {
        list.push(this.decode(o));
      }
    }
    return list;
  }
}
