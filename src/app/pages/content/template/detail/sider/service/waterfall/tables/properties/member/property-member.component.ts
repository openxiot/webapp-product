import {Component, Input} from '@angular/core';
import {Property, PropertyTemplate, Service, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {FormsModule} from "@angular/forms";
import {NzTagComponent} from 'ng-zorro-antd/tag';

@Component({
  selector: 'property-member',
  templateUrl: './property-member.component.html',
  styleUrls: ['./property-member.component.less'],
  standalone: true,
  imports: [
    FormsModule,
    NzTagComponent,
  ],
})
export class PropertyMemberComponent {
  @Input() service!: ServiceTemplate;
  @Input() property!: PropertyTemplate;
  @Input() language: string = 'zh-CN';

  getProperty(iid: number): Property | undefined {
    return this.service?.properties.get(iid);
  }
}
