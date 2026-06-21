import {Component, Input, OnInit, SimpleChanges, ViewContainerRef} from '@angular/core';
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
  ActionDefinition,
  LifeCycle, PropertyDefinition,
  PropertyType
} from '@openxiot/xiot-core-spec-ts';
import {AccountService} from '../../../../service/account.service';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {RouterLink} from '@angular/router';
import {ConfirmComponent} from '../../../../common/dialog/confirm/confirm.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../service/i18n.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzButtonModule} from 'ng-zorro-antd/button';

@Component({
  selector: 'spec-action',
  standalone: true,
  templateUrl: './spec.action.component.html',
  styleUrls: ['./spec.action.component.less'],
  imports: [
    FormsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzDividerModule,
    NzButtonModule,
    RouterLink,
    TranslatePipe,
    NzRowDirective,
    NzColDirective,
  ],
  providers: [
    NzModalService
  ],
})
export class SpecActionComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;

  @Input() namespace!: string;

  loading: boolean = true;
  actions: ActionDefinition[] = [];

  loadingProperties: boolean = true;
  properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  uuidSortFn: NzTableSortFn<ActionDefinition> = (a: ActionDefinition, b: ActionDefinition): number => a.type.value - b.type.value;
  codeSortFn: NzTableSortFn<ActionDefinition> = (a: ActionDefinition, b: ActionDefinition): number => a.type.name.localeCompare(b.type.name);

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
    this.loading = true;
    this.service.getActionDefinitions(this.namespace)
      .subscribe({
        next: data => {
          this.actions = data;
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })

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
      })
  }

  getPropertyDescription(type: PropertyType): string {
    const x = this.properties.get(type.name);
    if (x) {
      return x.description.get('zh-CN') || type.name;
    } else {
      return type.name;
    }
  }

  protected onDelete(def: ActionDefinition) {
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

  protected doDelete(def: ActionDefinition) {
    this.loading = true;
    this.service.deleteActionDefinition(def.type)
      .subscribe({
        next: data => {
          this.actions = this.actions.filter(x => x.type.name !== def.type.name);
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }
}
