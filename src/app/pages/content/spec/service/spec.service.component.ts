import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {MainService} from '../../../../service/main.service';
import {NzTableModule, NzTableQueryParams} from 'ng-zorro-antd/table';
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
  ],
})
export class SpecServiceComponent implements OnInit {

  loading: boolean = true;
  total: number = 0;
  services: ServiceDefinition[] = [];
  pageSize = 100;
  pageIndex = 1;
  pageSizeOptions = [10, 50, 100, 200, 500];

  loadingProperties: boolean = true;
  properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingActions: boolean = true;
  actions: Map<string, ActionDefinition> = new Map<string, ActionDefinition>();

  loadingEvents: boolean = true;
  events: Map<string, EventDefinition> = new Map<string, EventDefinition>();

  constructor(
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  loadDataFromServer(
    pageIndex: number,
    pageSize: number,
  ): void {
    this.loading = true;
    this.service.getSpecServices('jd', pageIndex, pageSize)
      .subscribe({
        next: data => {
          this.total = data.total;
          this.services = data.services;
          this.loading = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecServices: ', error);
        }
      })

    this.loadingProperties = true;
    this.service.getSpecProperties('jd', 1, 200)
      .subscribe({
        next: data => {
          this.properties = new Map(data.properties.map(item => [item.type.name, item]));
          this.loadingProperties = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecProperties: ', error);
        }
      })

    this.loadingActions = true;
    this.service.getSpecActions('jd', 1, 200)
      .subscribe({
        next: data => {
          this.actions = new Map(data.actions.map(item => [item.type.name, item]));
          this.loadingActions = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecActions: ', error);
        }
      })

    this.loadingEvents = true;
    this.service.getSpecEvents('jd', 1, 200)
      .subscribe({
        next: data => {
          this.events = new Map(data.events.map(item => [item.type.name, item]));
          this.loadingEvents = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecEvents: ', error);
        }
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    const { pageSize, pageIndex } = params;
    this.loadDataFromServer(pageIndex, pageSize);
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

  protected readonly LifeCycle = LifeCycle;
}
