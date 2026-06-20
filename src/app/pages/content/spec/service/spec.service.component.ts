import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewContainerRef} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {MainService} from '../../../../service/main.service';
import {NzTableModule, NzTableSortFn} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {
  LifeCycle,
  ActionType,
  PropertyType,
  EventType,
  PropertyDefinition,
  ServiceDefinition,
  ActionDefinition,
  EventDefinition
} from '@openxiot/xiot-core-spec-ts';
import {AccountService} from '../../../../service/account.service';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {RouterLink} from '@angular/router';
import {ConfirmComponent} from '../../../../common/dialog/confirm/confirm.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'spec-service',
  standalone: true,
  templateUrl: './spec.service.component.html',
  styleUrls: ['./spec.service.component.less'],
  imports: [
    FormsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzDividerComponent,
    RouterLink,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class SpecServiceComponent implements OnInit, OnChanges {

  protected readonly LifeCycle = LifeCycle;

  @Input() namespace!: string;

  loading: boolean = true;
  services: ServiceDefinition[] = [];

  loadingProperties: boolean = true;
  properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingActions: boolean = true;
  actions: Map<string, ActionDefinition> = new Map<string, ActionDefinition>();

  loadingEvents: boolean = true;
  events: Map<string, EventDefinition> = new Map<string, EventDefinition>();

  uuidSortFn: NzTableSortFn<ServiceDefinition> = (a: ServiceDefinition, b: ServiceDefinition): number => a.type.value - b.type.value;
  codeSortFn: NzTableSortFn<ServiceDefinition> = (a: ServiceDefinition, b: ServiceDefinition): number => a.type.name.localeCompare(b.type.name);

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    protected account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadDataFromServer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['namespace']) {
      this.loadDataFromServer();
    }
  }

  loadDataFromServer(): void {
    this.loading = true;
    this.service.getServiceDefinitions(this.namespace)
      .subscribe({
        next: data => {
          this.services = data;
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      });

    this.loadingProperties = true;
    this.service.getPropertyDefinitions(this.namespace)
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
    this.service.getActionDefinitions(this.namespace)
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
    this.service.getEventDefinitions(this.namespace)
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

  getPropertyDescription(type: PropertyType): string {
    const x = this.properties.get(type.name);
    if (x) {
      return x.description.get('zh-CN') || type.name;
    } else {
      return type.name;
    }
  }

  getActionDescription(type: ActionType): string {
    const x = this.actions.get(type.name);
    if (x) {
      return x.description.get('zh-CN') || type.name;
    } else {
      return type.name;
    }
  }

  getEventDescription(type: EventType): string {
    const x = this.events.get(type.name);
    if (x) {
      return x.description.get('zh-CN') || type.name;
    } else {
      return type.name;
    }
  }

  protected onDelete(def: ServiceDefinition) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: '您真的要删除这个方法定义吗？',
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: def.type.toString(),
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
        this.doDelete(def);
      }
    });
  }

  protected doDelete(def: ServiceDefinition) {
    this.loading = true;
    this.service.deleteServiceDefinition(def.type)
      .subscribe({
        next: data => {
          this.services = this.services.filter(x => x.type.name !== def.type.name);
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }
}
