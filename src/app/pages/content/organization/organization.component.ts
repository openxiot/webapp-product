import {Component, OnInit} from '@angular/core';
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
import {NzTableModule, NzTableQueryParams} from 'ng-zorro-antd/table';
import {AccountService} from '../../../service/account.service';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {Router, RouterLink} from '@angular/router';
import {Organization} from '../../../typedef/define/developer/Organization';
import {DatePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzIconDirective} from 'ng-zorro-antd/icon';

@Component({
  selector: 'main-organization',
  standalone: true,
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.less'],
  imports: [
    FormsModule,
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
    RouterLink,
    DatePipe,
    TranslatePipe,
    NzColDirective,
    NzIconDirective,
    NzRowDirective,
  ],
})
export class OrganizationComponent implements OnInit {

  loading: boolean = true;
  total: number = 0;
  organizations: Organization[] = [];
  pageSize = 100;
  pageIndex = 1;

  constructor(
    public account: AccountService,
    private router: Router,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadDataFromServer();
  }

  loadDataFromServer(): void {
    this.loading = true;
    this.service.getOrganizations()
      .subscribe({
        next: data => {
          this.organizations = data;
          this.loading = false;
          this.total = this.organizations.length;
        },
        error: error => {
          this.msg.warning('Failed to getOrganizations: ', error);
        }
      })
  }

  protected setCurrentOrganization(organization: Organization) {
    this.account.setOrganization(organization);

    this.router
      .navigate(['/main'])
      .then(() => {
        console.log('setCurrentOrganization ok!')
      })
      .catch(e => {
        console.log('setCurrentOrganization failed: ', e)
      });
  }
}
