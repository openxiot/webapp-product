import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewContainerRef} from '@angular/core';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzListModule} from 'ng-zorro-antd/list';
import {DeviceInstance, LifeCycle, Service} from '@openxiot/xiot-core-spec-ts';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {FormsModule} from '@angular/forms';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {DeviceInstanceServiceWaterfallComponent} from './service/waterfall/device.instance.service.waterfall.component';
import {DeviceInstanceServicesComponent} from './services/device.instance.services.component';
import {DeviceInstanceServiceSplitComponent} from './service/split/device.instance.service.split.component';

@Component({
  selector: 'device-instance',
  templateUrl: './device.instance.component.html',
  styleUrls: ['./device.instance.component.less'],
  standalone: true,
  imports: [
    NzMenuModule,
    NzLayoutModule,
    NzListModule,
    NzSelectModule,
    DeviceInstanceServiceWaterfallComponent,
    DeviceInstanceServicesComponent,
    DeviceInstanceServiceSplitComponent,
    FormsModule,
    NzSpaceModule,
  ],
  providers: [
    NzModalService
  ],
})
export class DeviceInstanceComponent implements OnChanges {

  @Input() version: boolean = false;
  @Input() expert: boolean = false;
  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Input() device: DeviceInstance | undefined = undefined;
  @Input() language: string = 'zh-CN';
  @Input() style: number = 1;
  @Output() changed = new EventEmitter<DeviceInstance>();
  @Output() removed = new EventEmitter<Service>();

  services: Service[] = [];
  service: Service | undefined = undefined;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private msg: NzMessageService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['device']) {
      this.services = this.device?.getServices() || [];

      if (this.service) {
        this.service = this.device?.services.get(this.service.iid);
      } else {
        this.service = undefined;
      }
    }
  }

  onServiceSelected(s: Service) {
    this.service = s;
  }

  onServiceChanged(service: Service) {
    this.changed.emit(this.device);
  }

  onServiceAdded(service: Service) {
    console.log('onServiceAdded: ', service.iid);

    this.device?.services.set(service.iid, service);
    this.services = this.device?.getServices() || [];
    this.service = service;

    this.changed.emit(this.device);
  }

  onServiceRemoved(service: Service) {
    console.log('onServiceRemoved: ', service.iid);

    this.service = undefined;
    this.device?.services.delete(service.iid);
    this.services = this.device?.getServices() || [];

    this.changed.emit(this.device);
  }
}
