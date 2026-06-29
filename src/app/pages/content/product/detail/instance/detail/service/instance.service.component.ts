import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Action, Event, LifeCycle, Property, Service} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzContentComponent, NzLayoutComponent, NzSiderComponent} from 'ng-zorro-antd/layout';
import {InstanceServiceCardComponent} from './card/instance.service.card.component';
import {DeviceInstanceServicePropertyComponent} from './detail/property/device.instance.service.property.component';
import {DeviceInstanceServiceDetailComponent} from './detail/service/device.instance.service.detail.component';
import {DeviceInstanceServiceActionComponent} from './detail/action/device.instance.service.action.component';
import {DeviceInstanceServiceEventComponent} from './detail/event/device.instance.service.event.component';
import {NzSelectModule} from 'ng-zorro-antd/select';

@Component({
  selector: 'instance-service',
  templateUrl: './instance.service.component.html',
  styleUrls: ['./instance.service.component.less'],
  standalone: true,
  imports: [
    NzTabsModule,
    NzCardModule,
    NzDescriptionsModule,
    NzSpaceModule,
    NzTagModule,
    NzTableModule,
    NzContentComponent,
    NzLayoutComponent,
    NzSiderComponent,
    NzSelectModule,
    InstanceServiceCardComponent,
    DeviceInstanceServicePropertyComponent,
    DeviceInstanceServiceDetailComponent,
    DeviceInstanceServiceActionComponent,
    DeviceInstanceServiceEventComponent,
  ]
})
export class InstanceServiceComponent implements OnChanges {

  @Input() version: boolean = false;
  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Input() editable: boolean = false;
  @Input() service!: Service;
  @Input() language: string = 'zh-CN';
  @Output() changed = new EventEmitter<Service>();
  @Output() removed = new EventEmitter<Service>();

  showServiceDetail: boolean = false;
  property: Property | undefined = undefined;
  action: Action | undefined = undefined;
  event: Event | undefined = undefined;

  constructor(
    public msg: NzMessageService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['service']) {
      this.showServiceDetail = false;
      this.property = undefined;
      this.action = undefined;
      this.event = undefined;
    }
  }

  protected onServiceRemoved(service: Service) {
    console.log('onServiceRemoved: ', service.iid);
    this.removed.emit(service);
  }

  protected onServiceChanged(service: Service) {
    console.log('onServiceChanged: ', service.iid);
    this.changed.emit(service);
  }

  protected onPropertyChanged(property: Property) {
    this.changed.emit(this.service);
  }

  protected onPropertyRemoved(property: Property) {
    this.service.properties.delete(property.iid);
    this.property = undefined;
    this.changed.emit(this.service);
  }

  protected onActionChanged(action: Action) {
    console.log('onActionChanged');
    this.changed.emit(this.service);
  }

  protected onActionRemoved(action: Action) {
    this.service.actions.delete(action.iid);
    this.action = undefined;
    this.changed.emit(this.service);
  }

  protected onEventChanged(event: Event) {
    console.log('onEventChanged');
    this.changed.emit(this.service);
  }

  protected onEventRemoved(event: Event) {
    this.service.events.delete(event.iid);
    this.event = undefined;
    this.changed.emit(this.service);
  }

  protected onTitleSelected(service: Service) {
    this.showServiceDetail = true;
    this.property = undefined;
    this.action = undefined;
    this.event = undefined;
  }

  protected onPropertySelected(property: Property) {
    this.showServiceDetail = false;
    this.property = property;
    this.action = undefined;
    this.event = undefined;
  }

  protected onActionSelected(action: Action) {
    this.showServiceDetail = false;
    this.property = undefined;
    this.action = action;
    this.event = undefined;
  }

  protected onEventSelected(event: Event) {
    this.showServiceDetail = false;
    this.property = undefined;
    this.action = undefined;
    this.event = event;
  }
}
