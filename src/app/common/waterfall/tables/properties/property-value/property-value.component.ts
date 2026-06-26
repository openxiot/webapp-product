import {Component, Input} from '@angular/core';
import {Property, Service, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'debugger-property-value',
  templateUrl: './property-value.component.html',
  standalone: true,
  imports: [
    FormsModule,
  ],
})
export class PropertyValueComponent {
  @Input() service!: ServiceTemplate;
  @Input() property!: Property;

  constructor(public msg: NzMessageService) {
    console.log("PropertyValueComponent.constructor");
  }

  getProperty(iid: number): Property | undefined {
    return this.service?.properties.get(iid);
  }
}
