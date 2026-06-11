import {
  DeviceType,
  Product,
  ProductFirmware,
  ProductInstance,
  ProductManual,
  ProductPanel,
  ProductWizard,
  LifeCycle,
  GenericVersion
} from '@openxiot/xiot-core-spec-ts';

export class JoyProduct {

  constructor(
    public basic: Product,
    public wizard: ProductWizard,
    public instances: ProductInstance[],
    public panels: ProductPanel[],
    public firmwares: ProductFirmware[],
    public manual: ProductManual,
  ) {
  }

  get CurrentInstance(): ProductInstance {
    let x = new ProductInstance();
    x.type = new DeviceType('urn:xiot-spec:device:switch:00000000:a:b:0');

    if (this.instances.length > 0) {
      for (let instance of this.instances) {
        if (instance.type && x.type) {
          if (instance.type.version > x.type.version) {
            x = instance;
          }
        }
      }
    }

    return x;
  }

  get CurrentPanel(): ProductPanel {
    let x = new ProductPanel(
      '',
      LifeCycle.DEVELOPMENT,
      'mobile',
      'web',
      null,
      null,
      new GenericVersion('', 0),
      new DeviceType('urn:xiot-spec:device:switch:00000000:a:b:0'),
      null,
      null
    );

    if (this.panels.length > 0) {
      for (let panel of this.panels) {
        if (x.updater === null) {
          x = panel;
        } else {
          if (panel.updater) {
            if (panel.updater.timestamp > x.updater.timestamp) {
              x = panel;
            }
          }
        }
      }
    }

    return x;
  }
}
