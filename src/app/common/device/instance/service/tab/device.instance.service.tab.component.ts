import {Component, Input} from '@angular/core';
import {Service} from '@openxiot/xiot-core-spec-ts';
import {PropertiesControllerComponent} from '../../tables/properties/properties.component';
import {ActionsControllerComponent} from '../../tables/actions/actions.component';
import {EventsControllerComponent} from '../../tables/events/events.component';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzCardModule} from 'ng-zorro-antd/card';

@Component({
  selector: 'device-instance-service-tab',
  templateUrl: './device.instance.service.tab.component.html',
  styleUrls: ['./device.instance.service.tab.component.less'],
  standalone: true,
  imports: [
    NzTabsModule,
    NzCardModule,
    PropertiesControllerComponent,
    ActionsControllerComponent,
    EventsControllerComponent,
  ],
})
export class DeviceInstanceServiceTabComponent {

  @Input() service!: Service;
  @Input() language: string = 'zh-CN';
}
