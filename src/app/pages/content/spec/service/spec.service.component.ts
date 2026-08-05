import {Component, Input, OnChanges, OnInit, signal, SimpleChanges, ViewContainerRef} from '@angular/core';
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
import {MainI18nService} from '../../../../service/i18n.service';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

@Component({
  selector: 'spec-service',
  standalone: true,
  templateUrl: './spec.service.component.html',
  styleUrl: './spec.service.component.less',
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
    NzButtonModule,
    NzWaveDirective,
    NzColDirective,
    NzRowDirective,
  ],
  providers: [
    NzModalService
  ],
})
export class SpecServiceComponent implements OnInit, OnChanges {

  protected readonly LifeCycle = LifeCycle;

  @Input()
  namespace: string = '';

  loading = signal(true);
  services = signal<ServiceDefinition[]>([]);

  loadingProperties = signal(true);
  properties = signal<Map<string, PropertyDefinition>>(new Map<string, PropertyDefinition>());

  loadingActions = signal(true);
  actions = signal<Map<string, ActionDefinition>>(new Map<string, ActionDefinition>());

  loadingEvents = signal(true);
  events = signal<Map<string, EventDefinition>>(new Map<string, EventDefinition>());

  uuidSortFn: NzTableSortFn<ServiceDefinition> = (a: ServiceDefinition, b: ServiceDefinition): number => a.type.value - b.type.value;
  codeSortFn: NzTableSortFn<ServiceDefinition> = (a: ServiceDefinition, b: ServiceDefinition): number => a.type.name.localeCompare(b.type.name);

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    protected account: AccountService,
    public i18n: MainI18nService,
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
    this.loading.set(true);
    this.service.getServiceDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.services.set(data);
          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      });

    this.loadingProperties.set(true);
    this.service.getPropertyDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.properties.set(new Map(data.map(item => [item.type.name, item])));
          this.loadingProperties.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      });

    this.loadingActions.set(true);
    this.service.getActionDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.actions.set(new Map(data.map(item => [item.type.name, item])));
          this.loadingActions.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      });

    this.loadingEvents.set(true);
    this.service.getEventDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.events.set(new Map(data.map(item => [item.type.name, item])));
          this.loadingEvents.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      });
  }

  getPropertyDescription(type: PropertyType): string {
    const x = this.properties().get(type.name);
    if (x) {
      return x.description.get(this.i18n.getCurrentLang()) || type.name;
    } else {
      return type.name;
    }
  }

  getActionDescription(type: ActionType): string {
    const x = this.actions().get(type.name);
    if (x) {
      return x.description.get(this.i18n.getCurrentLang()) || type.name;
    } else {
      return type.name;
    }
  }

  getEventDescription(type: EventType): string {
    const x = this.events().get(type.name);
    if (x) {
      return x.description.get(this.i18n.getCurrentLang()) || type.name;
    } else {
      return type.name;
    }
  }

  protected onDelete(def: ServiceDefinition) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个方法定义吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: def.type.toString(),
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
        this.doDelete(def);
      }
    });
  }

  protected doDelete(def: ServiceDefinition) {
    this.loading.set(true);
    this.service.deleteServiceDefinition(def.type)
      .subscribe({
        next: data => {
          this.services.set(this.services().filter(x => x.type.name !== def.type.name));
          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }
}
