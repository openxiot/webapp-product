import {Component, EventEmitter, input, Output, ViewContainerRef} from '@angular/core';
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
import {NzDropdownModule} from 'ng-zorro-antd/dropdown';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../../../../service/i18n.service';
import {PropertyOption} from '../../../../../../../../common/dialog/instance/create/property/PropertyOption';
import {ActionOption} from '../../../../../../../../common/dialog/instance/create/action/ActionOption';
import {EventOption} from '../../../../../../../../common/dialog/instance/create/event/EventOption';
import {InstanceOp} from '../../../../../../../../typedef/instance/InstanceEditor';

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
    NzDropdownModule,
    TranslatePipe
  ],
  providers: [
    NzModalService
  ],
})
export class InstanceServiceCardComponent {

  protected readonly LifeCycle = LifeCycle;

  showVersion = input(false);
  editable = input(false);
  service = input.required<Service>();
  @Output() titleSelected = new EventEmitter<Service>();
  @Output() propertySelected = new EventEmitter<Property>();
  @Output() actionSelected = new EventEmitter<Action>();
  @Output() eventSelected = new EventEmitter<Event>();
  @Output() op = new EventEmitter<InstanceOp>();

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
      nzData: new PropertyOption(this.service().type, this.getNewPropertyIID()),
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
        this.op.emit({kind: 'addProperties', serviceIid: this.service().iid, properties: [result]});
      }
    });
  }

  onAddAction() {
    const modal = this.modal.create<CreateActionComponent, ActionOption, Action>({
      nzTitle: this.i18n.translate.instant('添加方法'),
      nzWidth: 1000,
      nzContent: CreateActionComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new ActionOption(this.service().type, this.getNewActionIID()),
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
        this.op.emit({kind: 'addActions', serviceIid: this.service().iid, actions: [result]});
      }
    });
  }

  onAddEvent() {
    const modal = this.modal.create<CreateEventComponent, EventOption, Event>({
      nzTitle: this.i18n.translate.instant('添加事件'),
      nzWidth: 1000,
      nzContent: CreateEventComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new EventOption(this.service().type, this.getNewEventIID()),
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
        this.op.emit({kind: 'addEvents', serviceIid: this.service().iid, events: [result]});
      }
    });
  }

  private getNewPropertyIID() {
    let iid: number = 1;

    for (let item of this.service().properties.values()) {
      if (item.iid > iid) {
        iid = item.iid;
      }
    }

    return iid + 1;
  }

  private getNewActionIID() {
    let iid: number = 1;

    for (let item of this.service().actions.values()) {
      if (item.iid > iid) {
        iid = item.iid;
      }
    }

    return iid + 1;
  }

  private getNewEventIID() {
    let iid: number = 1;

    // 修复：原先误遍历 actions，导致事件 iid 与已有事件冲突。
    for (let item of this.service().events.values()) {
      if (item.iid > iid) {
        iid = item.iid;
      }
    }

    return iid + 1;
  }
}
