import {ProductFirmware} from '@openxiot/xiot-core-spec-ts';

export class EditFirmwareResult {

  constructor(
    public operator: string,
    public firmware: ProductFirmware
  ) {
  }
}
