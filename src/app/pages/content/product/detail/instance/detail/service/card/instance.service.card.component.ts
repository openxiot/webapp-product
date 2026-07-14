import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {Action, Event, LifeCycle, Property, Service} from '@openxiot/xiot-core-spec-ts';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CreatePropertyComponent} from '../../../../../../../../common/dialog/instance/create/property/create.property.component';
import {CreateActionComponent} from '../../../../../../../../common/dialog/instance/create/action/create.action.component';
import {CreateEventComponent} from '../../../../../../../../common/dialog/instance/create/event/create.event.component';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../../../../service/i18n.service';
import {PropertyOption} from '../../../../../../../../common/dialog/instance/create/property/PropertyOption';
import {ActionOption} from '../../../../../../../../common/dialog/instance/create/action/ActionOption';
import {EventOption} from '../../../../../../../../common/dialog/instance/create/event/EventOption';

@Component({
  selector: 'instance-service-card',
  templateUrl: './instance.service.card.component.html',
  styleUrl: './instance.service.card.component.less',
  standalone: true,
  imports: [
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
export class InstanceServiceCardComponent {

  protected readonly LifeCycle = LifeCycle;

  @Input() showVersion: boolean = false;
  @Input() editable: boolean = false;
  @Input() service!: Service;
  @Output() titleSelected = new EventEmitter<Service>();
  @Output() propertySelected = new EventEmitter<Property>();
  @Output() actionSelected = new EventEmitter<Action>();
  @Output() eventSelected = new EventEmitter<Event>();
  @Output() changed = new EventEmitter<Service>();

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public i18n: MainI18nService,
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
    const modal = this.modal.create<CreatePropertyComponent, PropertyOption, Property>({
      nzTitle: this.i18n.translate.instant('添加属性'),
      nzWidth: 1000,
      nzContent: CreatePropertyComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new PropertyOption(this.service.type, this.getNewPropertyIID()),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
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
    const modal = this.modal.create<CreateActionComponent, ActionOption, Action>({
      nzTitle: this.i18n.translate.instant('添加方法'),
      nzWidth: 1000,
      nzContent: CreateActionComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new ActionOption(this.service.type, this.getNewActionIID()),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
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
    const modal = this.modal.create<CreateEventComponent, EventOption, Event>({
      nzTitle: this.i18n.translate.instant('添加事件'),
      nzWidth: 1000,
      nzContent: CreateEventComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new EventOption(this.service.type, this.getNewEventIID()),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
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

  private getNewPropertyIID() {
    let iid: number = 1;

    if (this.service) {
      for (let item of this.service.properties.values()) {
        if (item.iid > iid) {
          iid = item.iid;
        }
      }

      iid ++;
    }

    return iid;
  }

  private getNewActionIID() {
    let iid: number = 1;

    if (this.service) {
      for (let item of this.service.actions.values()) {
        if (item.iid > iid) {
          iid = item.iid;
        }
      }

      iid ++;
    }

    return iid;
  }

  private getNewEventIID() {
    let iid: number = 1;

    if (this.service) {
      for (let item of this.service.actions.values()) {
        if (item.iid > iid) {
          iid = item.iid;
        }
      }

      iid ++;
    }

    return iid;
  }
}
