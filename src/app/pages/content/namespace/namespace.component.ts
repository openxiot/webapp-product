import {Component, OnInit, ViewContainerRef, signal} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {BreadcrumbTranslateDirective} from '../../../common/component/breadcrumb/breadcrumb-translate.directive';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NamespaceDefinition, Visibility} from '@openxiot/xiot-core-spec-ts';
import {NzTableModule} from 'ng-zorro-antd/table';
import {AccountService} from '../../../service/account.service';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {RouterLink} from '@angular/router';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {TranslatePipe} from '@ngx-translate/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {ConfirmComponent} from '../../../common/dialog/confirm/confirm.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {MainI18nService} from '../../../service/i18n.service';

@Component({
  selector: 'main-namespace',
  standalone: true,
  templateUrl: './namespace.component.html',
  styleUrl: './namespace.component.less',
  imports: [
    FormsModule,
    RouterLink,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    BreadcrumbTranslateDirective,
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

  loading = signal(true);
  namespaces = signal<NamespaceDefinition[]>([]);
  pageSize = 100;
  pageIndex = 1;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public account: AccountService,
    private service: MainService,
    protected i18n: MainI18nService,
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
    this.loading.set(true);
    this.service.getAllNamespaces(this.account.organization())
      .subscribe({
        next: data => {
          this.namespaces.set(data);
          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      })
  }

  protected onDelete(ns: NamespaceDefinition) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个名字空间吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: ns.namespace,
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
        this.doDelete(ns);
      }
    });
  }

  protected doDelete(ns: NamespaceDefinition) {
    this.loading.set(true);
    this.service.deleteNamespace(ns.namespace)
      .subscribe({
        next: data => {
          this.namespaces.set(this.namespaces().filter(x => x.namespace !== ns.namespace));
          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      })
  }
}
