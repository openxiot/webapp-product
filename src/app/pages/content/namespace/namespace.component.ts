import {Component, OnInit} from '@angular/core';
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
    TranslatePipe
  ],
})
export class NamespaceComponent implements OnInit {

  loading: boolean = true;
  total: number = 0;
  namespaces: NamespaceDefinition[] = [];
  pageSize = 100;
  pageIndex = 1;

  constructor(
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

  protected readonly Visibility = Visibility;
}
