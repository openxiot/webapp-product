import {Component, EventEmitter, input, OnInit, Output, signal, ViewContainerRef} from '@angular/core';
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
import {NzDropdownModule} from 'ng-zorro-antd/dropdown';
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
import {TemplateOp} from '../../../../../../typedef/template/TemplateEditor';

@Component({
  selector: 'template-services',
  templateUrl: './template.services.component.html',
  styleUrl: './template.services.component.less',
  standalone: true,
  imports: [
    TranslatePipe,
    NzTagComponent,
    NzMenuModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzDropdownModule,
    NzButtonModule,
    NzSpinModule,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateServicesComponent implements OnInit {

  showVersion = input(false);
  editable = input(false);
  device = input.required<DeviceTemplate>();
  @Output() selected = new EventEmitter<ServiceTemplate>();
  @Output() op = new EventEmitter<TemplateOp>();

  loading = signal(false);
  services: ServiceDefinition[] = [];

  loadingProperties = signal(true);
  properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingActions = signal(true);
  actions: Map<string, ActionDefinition> = new Map<string, ActionDefinition>();

  loadingEvents = signal(true);
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
    this.loading.set(true);
    this.main.getServiceDefinitions(this.account.ns().namespace).subscribe({
      next: data => {
        this.services = data;
        this.loading.set(false);
      },
      error: error => {
        this.msg.warning(error);
        this.loading.set(false);
      }
    });

    this.loadingProperties.set(true);
    this.main.getPropertyDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.properties = new Map(data.map(item => [item.type.name, item]));
          this.loadingProperties.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loadingProperties.set(false);
        }
      });

    this.loadingActions.set(true);
    this.main.getActionDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.actions = new Map(data.map(item => [item.type.name, item]));
          this.loadingActions.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loadingActions.set(false);
        }
      });

    this.loadingEvents.set(true);
    this.main.getEventDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.events = new Map(data.map(item => [item.type.name, item]));
          this.loadingEvents.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loadingEvents.set(false);
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
          disabled: component => component!.disabled(),
          onClick: component => component!.ok()
        }
      ],
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });

    modal.afterClose.subscribe(result => {
      if (result && result.length > 0) {
        if (this.device()) {
          // 由顶层 reducer 在克隆体上执行 DeviceTemplateHelper，绝不在共享 device 上原地 add。
          this.op.emit({
            kind: 'addService',
            defs: result,
            version: this.device()!.type.version || 1,
            properties: this.properties,
            actions: this.actions,
            events: this.events,
          });
        }
      }
    });
  }
}
