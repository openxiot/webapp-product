import {ProductFirmware, ProductFirmwareInstance, ProductInstance} from '@openxiot/xiot-core-spec-ts';

export class UploadFirmware {

  constructor(
    public productId: number,
    public productInstances: ProductInstance[] = [],
    public firmware: ProductFirmware,
    public firmwareInstances: ProductFirmwareInstance[],
  ) {
  }
}
