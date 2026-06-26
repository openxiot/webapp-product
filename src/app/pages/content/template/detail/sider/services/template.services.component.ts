import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef} from '@angular/core';
import {
  ActionDefinition,
  DeviceTemplate,
  EventDefinition,
  PropertyDefinition,
  ServiceDefinition,
  ServiceTemplate
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
import {MainI18nService} from '../../../../../../service/i18n.service';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {
  ServicesDefinitionSelectorComponent
} from '../../../../../../common/dialog/definition/select/services/services.definition.selector.component';
import {ServicesOption} from '../../../../../../common/dialog/definition/select/services/ServicesOption';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {MainService} from '../../../../../../service/main.service';
import {AccountService} from '../../../../../../service/account.service';
import {DeviceTemplateHelper} from '../../../../../../typedef/template/DeviceTemplateHelper';

@Component({
  selector: 'template-services',
  templateUrl: './template.services.component.html',
  styleUrls: ['./template.services.component.less'],
  standalone: true,
  imports: [
    TranslatePipe,
    NzTagComponent,
    NzMenuModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzDropDownModule,
    NzButtonModule,
    NzSpinModule,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateServicesComponent implements OnInit {

  @Input() showVersion: boolean = false;
  @Input() editable: boolean = false;
  @Input() device: DeviceTemplate | undefined = undefined;
  @Output() selected = new EventEmitter<ServiceTemplate>();
  @Output() changed = new EventEmitter<void>();

  loading: boolean = false;
  services: ServiceDefinition[] = [];

  loadingProperties: boolean = true;
  properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingActions: boolean = true;
  actions: Map<string, ActionDefinition> = new Map<string, ActionDefinition>();

  loadingEvents: boolean = true;
  events: Map<string, EventDefinition> = new Map<string, EventDefinition>();

  constructor(
    public i18n: MainI18nService,
    private modal: NzModalService,
    private account: AccountService,
    private viewContainerRef: ViewContainerRef,
    private main: MainService,
    private msg: NzMessageService
  ) {
  }

  ngOnInit(): void {
    this.loadDefinitions();
  }

  private loadDefinitions(): void {
    this.loading = true;
    this.main.getServiceDefinitions(this.account.ns.namespace).subscribe({
      next: data => {
        this.services = data;
        this.loading = false;
      },
      error: error => {
        this.msg.warning(error);
      }
    });

    this.loadingProperties = true;
    this.main.getPropertyDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.properties = new Map(data.map(item => [item.type.name, item]));
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
          this.actions = new Map(data.map(item => [item.type.name, item]));
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
          this.events = new Map(data.map(item => [item.type.name, item]));
          this.loadingEvents = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      });
  }

  onClickService(s: ServiceTemplate) {
    this.selected.emit(s);
  }

  onAddService() {
    const modal = this.modal.create<ServicesDefinitionSelectorComponent, ServicesOption, ServiceDefinition[]>({
      nzTitle: this.i18n.translate.instant('添加服务'),
      nzWidth: 800,
      nzContent: ServicesDefinitionSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new ServicesOption(this.services),
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
          if (this.device) {
            const helper = new DeviceTemplateHelper(this.device);
            helper.addServiceDefinitions(result, this.device?.type?.version || 1);
            this.changed.emit();
          }
        }
      }
    });
  }
}
