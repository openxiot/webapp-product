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
import {InstanceServicesComponent} from './services/instance.services.component';
import {InstanceServiceComponent} from './service/instance.service.component';

@Component({
  selector: 'product-instance-detail',
  templateUrl: './product.instance.detail.component.html',
  styleUrls: ['./product.instance.detail.component.less'],
  standalone: true,
  imports: [
    NzMenuModule,
    NzLayoutModule,
    NzListModule,
    NzSelectModule,
    InstanceServicesComponent,
    InstanceServiceComponent,
    FormsModule,
    NzSpaceModule,
  ],
  providers: [
    NzModalService
  ],
})
export class ProductInstanceDetailComponent implements OnChanges {

  @Input() editable: boolean = false;
  @Input() version: boolean = false;
  @Input() instance: DeviceInstance | undefined = undefined;
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
      this.services = this.instance?.getServices() || [];

      if (this.service) {
        this.service = this.instance?.services.get(this.service.iid);
      } else {
        this.service = undefined;
      }
    }
  }

  onServiceSelected(s: Service) {
    this.service = s;
  }

  onServiceChanged(service: Service) {
    this.changed.emit(this.instance);
  }

  onServiceAdded(service: Service) {
    console.log('onServiceAdded: ', service.iid);

    this.instance?.services.set(service.iid, service);
    this.services = this.instance?.getServices() || [];
    this.service = service;

    this.changed.emit(this.instance);
  }

  onServiceRemoved(service: Service) {
    console.log('onServiceRemoved: ', service.iid);

    this.service = undefined;
    this.instance?.services.delete(service.iid);
    this.services = this.instance?.getServices() || [];

    this.changed.emit(this.instance);
  }
}
