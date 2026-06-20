import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {Action, ActionType, Event, EventType, LifeCycle, Property, PropertyType, Service} from '@openxiot/xiot-core-spec-ts';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CreatePropertyComponent} from '../../../../../dialog/instance/create/property/create.property.component';
import {CreateActionComponent} from '../../../../../dialog/instance/create/action/create.action.component';
import {CreateEventComponent} from '../../../../../dialog/instance/create/event/create.event.component';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {DataFormat} from '@openxiot/xiot-core-spec-ts';
import {Access} from '@openxiot/xiot-core-spec-ts';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'device-instance-service-menu',
  templateUrl: './device.instance.service.menu.component.html',
  styleUrls: ['./device.instance.service.menu.component.less'],
  standalone: true,
  imports: [
    NzButtonComponent,
    NzTagComponent,
    NzMenuModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzDropDownModule,
    TranslatePipe
  ],
  providers: [
    NzModalService
  ],
})
export class DeviceInstanceServiceMenuComponent {

  protected readonly LifeCycle = LifeCycle;

  @Input() version: boolean = false;
  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Input() service!: Service;
  @Input() language: string = 'zh-CN';
  @Output() titleSelected = new EventEmitter<Service>();
  @Output() propertySelected = new EventEmitter<Property>();
  @Output() actionSelected = new EventEmitter<Action>();
  @Output() eventSelected = new EventEmitter<Event>();
  @Output() changed = new EventEmitter<Service>();

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private msg: NzMessageService
  ) {
  }

  onClickTitle(service: Service) {
    this.titleSelected.emit(service);
  }

  onClickProperty(p: Property) {
    this.propertySelected.emit(p);
  }

  onClickAction(a: Action) {
    this.actionSelected.emit(a);
  }

  onClickEvent(e: Event) {
    this.eventSelected.emit(e);
  }

  onAddProperty() {
    let iid: number = 1024;

    if (this.service) {
      for (let item of this.service.properties.values()) {
        if (item.iid > iid) {
          iid = item.iid;
        }
      }

      iid ++;
    }

    const org = this.service?.type.organization || 'org';
    const model = this.service?.type.model || 'model';
    const version = this.service?.type.version || 0;
    const type = new PropertyType(`urn:${org}:property:unnamed:00000000:${org}:${model}:${version}`);
    const description = new Map<string, string>();
    description.set('zh-CN', '自定义属性');
    const format = DataFormat.BOOL;
    const access = Access.of(true, true, true);
    const constraintValue = null;
    const unit = null;

    const modal = this.modal.create<CreatePropertyComponent, Property, Property>({
      nzTitle: '添加属性',
      nzWidth: 1000,
      nzContent: CreatePropertyComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new Property(iid, type, description, format, access, constraintValue, unit),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '确认',
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.addProperty(result);
      }
    });
  }

  onAddAction() {
    let iid: number = 1024;

    if (this.service) {
      for (let item of this.service.actions.values()) {
        if (item.iid > iid) {
          iid = item.iid;
        }
      }

      iid ++;
    }

    const org = this.service?.type.organization || 'org';
    const model = this.service?.type.model || 'model';
    const version = this.service?.type.version || 0;
    const type = new ActionType(`urn:${org}:action:unnamed:00000000:${org}:${model}:${version}`);
    const description = new Map<string, string>();
    description.set('zh-CN', '自定义方法');

    const modal = this.modal.create<CreateActionComponent, Action, Action>({
      nzTitle: '添加方法',
      nzWidth: 1000,
      nzContent: CreateActionComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new Action(iid, type, description, [], []),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '确认',
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.addAction(result);
      }
    });
  }

  onAddEvent() {
    let iid: number = 1024;

    if (this.service) {
      for (let item of this.service.actions.values()) {
        if (item.iid > iid) {
          iid = item.iid;
        }
      }

      iid ++;
    }

    const org = this.service?.type.organization || 'org';
    const model = this.service?.type.model || 'model';
    const version = this.service?.type.version || 0;
    const type = new EventType(`urn:${org}:event:unnamed:00000000:${org}:${model}:${version}`);
    const description = new Map<string, string>();
    description.set('zh-CN', '自定义事件');

    const modal = this.modal.create<CreateEventComponent, Event, Event>({
      nzTitle: '添加事件',
      nzWidth: 1000,
      nzContent: CreateEventComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new Event(iid, type, description, []),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '确认',
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.addEvent(result);
      }
    });
  }

  private addProperty(property: Property) {
    this.service?.properties.set(property.iid, property);
    this.changed.emit(this.service);
  }

  private addAction(action: Action) {
    this.service?.actions.set(action.iid, action);
    this.changed.emit(this.service);
  }

  private addEvent(event: Event) {
    this.service?.events.set(event.iid, event);
    this.changed.emit(this.service);
  }
}
