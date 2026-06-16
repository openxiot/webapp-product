import {Property, Service} from '@openxiot/xiot-core-spec-ts';

export class EditableProperty {

  constructor(
    public service: Service,
    public property: Property,
  ) {
  }
}
