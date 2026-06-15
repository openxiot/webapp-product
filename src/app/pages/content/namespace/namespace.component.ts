import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NamespaceDefinition, Visibility} from '@openxiot/xiot-core-spec-ts';
import {NzTableModule, NzTableQueryParams} from 'ng-zorro-antd/table';
import {AccountService} from '../../../service/account.service';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {RouterLink} from '@angular/router';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {TranslatePipe} from '@ngx-translate/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {ConfirmComponent} from '../../../common/dialog/confirm/confirm.component';
import {NzModalService} from 'ng-zorro-antd/modal';

@Component({
  selector: 'main-namespace',
  standalone: true,
  templateUrl: './namespace.component.html',
  styleUrls: ['./namespace.component.less'],
  imports: [
    FormsModule,
    RouterLink,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzDescriptionsModule,
    NzButtonComponent,
    NzWaveDirective,
    NzTagModule,
    TranslatePipe,
    NzDividerComponent
  ],
  providers: [
    NzModalService
  ],
})
export class NamespaceComponent implements OnInit {

  protected readonly Visibility = Visibility;

  loading: boolean = true;
  total: number = 0;
  namespaces: NamespaceDefinition[] = [];
  pageSize = 100;
  pageIndex = 1;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public account: AccountService,
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
    this.service.getSpecNamespaces()
      .subscribe({
        next: data => {
          this.namespaces = data;
          this.loading = false;
          this.total = this.namespaces.length;
        },
        error: error => {
          this.msg.warning('Failed to getSpecNamespaces: ', error);
        }
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    const { pageSize, pageIndex } = params;
    this.loadDataFromServer(pageIndex, pageSize);
  }

  protected onDelete(ns: NamespaceDefinition) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: '您真的要删除这个名字空间吗？',
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: ns.namespace,
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
        this.doDelete(ns);
      }
    });
  }

  protected doDelete(ns: NamespaceDefinition) {
    this.loading = true;
    this.service.deleteNamespace(ns.namespace)
      .subscribe({
        next: data => {
          this.namespaces = this.namespaces.filter(x => x.namespace !== ns.namespace);
          this.loading = false;
          this.total = this.namespaces.length;
        },
        error: error => {
          this.msg.warning('Failed to deleteNamespace: ', error);
        }
      })
  }
}
