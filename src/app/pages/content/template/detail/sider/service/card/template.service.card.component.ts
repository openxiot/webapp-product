import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef} from '@angular/core';
import {
  ActionTemplate,
  EventTemplate,
  PropertyTemplate,
  PropertyDefinition,
  ServiceTemplate, ActionDefinition, EventDefinition
} from '@openxiot/xiot-core-spec-ts';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../../../service/i18n.service';
import {
  PropertiesDefinitionSelectorComponent
} from '../../../../../../../common/dialog/definition/select/properties/properties.definition.selector.component';
import {PropertiesOption} from '../../../../../../../common/dialog/definition/select/properties/PropertiesOption';
import {ServiceTemplateHelper} from '../../../../../../../typedef/template/ServiceTemplateHelper';
import {
  ActionsDefinitionSelectorComponent
} from '../../../../../../../common/dialog/definition/select/actions/actions.definition.selector.component';
import {ActionsOption} from '../../../../../../../common/dialog/definition/select/actions/ActionsOption';
import {
  EventsDefinitionSelectorComponent
} from '../../../../../../../common/dialog/definition/select/events/events.definition.selector.component';
import {EventsOption} from '../../../../../../../common/dialog/definition/select/events/EventsOption';
import {MainService} from '../../../../../../../service/main.service';
import {AccountService} from '../../../../../../../service/account.service';

@Component({
  selector: 'template-service-card',
  templateUrl: './template.service.card.component.html',
  styleUrls: ['./template.service.card.component.less'],
  standalone: true,
  imports: [
    NzTagComponent,
    NzMenuModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzDropDownModule,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateServiceCardComponent implements OnInit {

  @Input() showVersion: boolean = false;
  @Input() editable: boolean = false;
  @Input() service!: ServiceTemplate;
  @Output() changed = new EventEmitter<void>();
  @Output() titleSelected = new EventEmitter<ServiceTemplate>();
  @Output() propertySelected = new EventEmitter<PropertyTemplate>();
  @Output() actionSelected = new EventEmitter<ActionTemplate>();
  @Output() eventSelected = new EventEmitter<EventTemplate>();

  loadingProperties: boolean = true;
  properties: PropertyDefinition[] = [];

  loadingActions: boolean = true;
  actions: ActionDefinition[] = [];

  loadingEvents: boolean = true;
  events: EventDefinition[] = [];

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private account: AccountService,
    private main: MainService,
    protected i18n: MainI18nService,
    private msg: NzMessageService
  ) {
  }

  ngOnInit(): void {
    this.loadDefinitions();
  }

  private loadDefinitions(): void {
    this.loadingProperties = true;
    this.main.getPropertyDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.properties = data;
          this.loadingProperties = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      });

    this.loadingActions = true;
    this.main.getActionDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.actions = data;
          this.loadingActions = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      });

    this.loadingEvents = true;
    this.main.getEventDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.events = data;
          this.loadingEvents = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      });
  }

  onClickTitle(service: ServiceTemplate) {
    this.titleSelected.emit(service);
  }

  onClickProperty(p: PropertyTemplate) {
    this.propertySelected.emit(p);
  }

  onClickAction(a: ActionTemplate) {
    this.actionSelected.emit(a);
  }

  onClickEvent(e: EventTemplate) {
    this.eventSelected.emit(e);
  }

  onAddProperty() {
    const modal = this.modal.create<
      PropertiesDefinitionSelectorComponent,
      PropertiesOption,
      PropertyDefinition[]
    >({
      nzTitle: this.i18n.translate.instant('添加属性'),
      nzWidth: 800,
      nzContent: PropertiesDefinitionSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new PropertiesOption(this.properties),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: false,
          type: 'primary',
          disabled: component => component!.disabled || false,
          onClick: component => component!.ok()
        }
      ],
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        if (result.length > 0) {
          const helper = new ServiceTemplateHelper(this.service);
          helper.addPropertyDefinitions(result, this.service?.type?.version || 1);
          this.changed.emit();
        }
      }
    });
  }

  onAddAction() {
    const modal = this.modal.create<
      ActionsDefinitionSelectorComponent,
      ActionsOption,
      ActionDefinition[]
    >({
      nzTitle: this.i18n.translate.instant('添加方法'),
      nzWidth: 800,
      nzContent: ActionsDefinitionSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new ActionsOption(this.actions),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: false,
          type: 'primary',
          disabled: component => component!.disabled || false,
          onClick: component => component!.ok()
        }
      ],
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        if (result.length > 0) {
          const helper = new ServiceTemplateHelper(this.service);
          helper.addActionDefinitions(result, this.service?.type?.version || 1);
          this.changed.emit();
        }
      }
    });
  }

  onAddEvent() {
    const modal = this.modal.create<
      EventsDefinitionSelectorComponent,
      EventsOption,
      EventDefinition[]
    >({
      nzTitle: this.i18n.translate.instant('添加事件'),
      nzWidth: 800,
      nzContent: EventsDefinitionSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new EventsOption(this.events),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: false,
          type: 'primary',
          disabled: component => component!.disabled || false,
          onClick: component => component!.ok()
        }
      ],
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        if (result.length > 0) {
          const helper = new ServiceTemplateHelper(this.service);
          helper.addEventDefinitions(result, this.service?.type?.version || 1);
          this.changed.emit();
        }
      }
    });
  }
}
