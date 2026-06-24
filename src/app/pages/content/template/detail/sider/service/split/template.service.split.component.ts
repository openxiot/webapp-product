import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewContainerRef} from '@angular/core';
import {
  Action,
  ActionTemplate,
  Event, EventTemplate,
  Property,
  PropertyTemplate,
  Service,
  ServiceTemplate
} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzContentComponent, NzLayoutComponent, NzSiderComponent} from 'ng-zorro-antd/layout';
import {TemplateServiceCardComponent} from './card/template.service.card.component';
import {TemplateCardPropertyComponent} from './member/property/template.card.property.component';
import {TemplateCardServiceComponent} from './member/service/template.card.service.component';
import {TemplateCardActionComponent} from './member/action/template.card.action.component';
import {TemplateCardEventComponent} from './member/event/template.card.event.component';

@Component({
  selector: 'template-service-split',
  templateUrl: './template.service.split.component.html',
  styleUrls: ['./template.service.split.component.less'],
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
    TemplateServiceCardComponent,
    TemplateCardPropertyComponent,
    TemplateCardServiceComponent,
    TemplateCardActionComponent,
    TemplateCardEventComponent,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateServiceSplitComponent implements OnChanges {

  @Input() showVersion: boolean = false;
  @Input() editable: boolean = false;
  @Input() service!: ServiceTemplate;
  @Output() changed = new EventEmitter<void>();
  @Output() removed = new EventEmitter<ServiceTemplate>();

  showServiceDetail: boolean = false;
  property: PropertyTemplate | undefined = undefined;
  action: ActionTemplate | undefined = undefined;
  event: EventTemplate | undefined = undefined;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public msg: NzMessageService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['service']) {
      this.property = undefined;
      this.action = undefined;
      this.event = undefined;
    }
  }

  // onServiceRemoved(service: Service) {
  //   this.removed.emit(service);
  // }
  //
  // onPropertyChanged(property: Property) {
  //   this.changed.emit(this.service);
  // }
  //

  onPropertyRemoved(property: PropertyTemplate) {
    this.service.properties.delete(property.iid);
    this.changed.emit();
    this.property = undefined;
  }

  onActionRemoved(action: ActionTemplate) {
    this.service.actions.delete(action.iid);
    this.changed.emit();
    this.action = undefined;
  }

  onEventRemoved(event: EventTemplate) {
    this.service.events.delete(event.iid);
    this.changed.emit();
    this.event = undefined;
  }

  onTitleSelected(service: ServiceTemplate) {
    this.showServiceDetail = true;
    this.property = undefined;
    this.action = undefined;
    this.event = undefined;
  }

  onPropertySelected(property: PropertyTemplate) {
    this.showServiceDetail = false;
    this.property = property;
    this.action = undefined;
    this.event = undefined;
  }

  onActionSelected(action: ActionTemplate) {
    this.showServiceDetail = false;
    this.property = undefined;
    this.action = action;
    this.event = undefined;
  }

  onEventSelected(event: EventTemplate) {
    this.showServiceDetail = false;
    this.property = undefined;
    this.action = undefined;
    this.event = event;
  }

  protected onChanged() {
    this.changed.emit();
  }

  protected onRemoved() {
    this.removed.emit(this.service);
  }
}
