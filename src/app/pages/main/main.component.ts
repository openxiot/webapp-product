import {Component, OnInit} from '@angular/core';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import pkg from '../../../../package.json';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NoticeCardComponent} from './notice/card/notice.card.component';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {CookieService} from 'ngx-cookie-service';
import {AccountService} from '../../service/account.service';
import {MainService} from '../../service/main.service';
import {Organization} from '../../typedef/define/developer/Organization';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../service/i18n.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less'],
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzSpinModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzDropDownModule,
    NzAvatarModule,
    NzSpaceModule,
    NzBadgeModule,
    NoticeCardComponent,
    TranslatePipe,
  ],
  providers: [
    CookieService
  ]
})
export class MainComponent implements OnInit {

  version: string = pkg.version;

  loading: boolean = false;
  organizations: Organization[] = [];

  constructor(
    public account: AccountService,
    public i18n: MainI18nService,
    private main: MainService,
    private router: Router,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    console.log('init');

    this.loadOrganizations();
  }

  private loadOrganizations() {
    if (this.account.login) {
      this.loading = true;
      this.main.getOrganizations()
        .subscribe({
          next: data => {
            this.organizations = data;
            this.selectCurrentOrganization();
            this.loading = false;
          },
          error: error => {
            this.msg.warning('Failed to getOrganizations: ', error);
          }
        })
    }
  }

  private selectCurrentOrganization() {
    const selected = localStorage.getItem("organizationId") || null;
    if (selected !== null) {
      const org = this.organizations.find(x => x.id === selected);
      if (org) {
        this.account.setOrganization(org);
      }
    } else {
      if (this.organizations.length > 0) {
        const org = this.organizations[0];
        this.account.setOrganization(org);
      }
    }
  }

  protected goOrganizations() {
    this.router
      .navigate(['/main/organization'])
      .then(() => {
        console.log('goOrganizations ok!')
      })
      .catch(e => {
        console.log('goOrganizations failed: ', e)
      });
  }

  protected goAddOrganization() {
    this.router
      .navigate(['/main/organization/add'])
      .then(() => {
        console.log('goAddOrganization ok!')
      })
      .catch(e => {
        console.log('goAddOrganization failed: ', e)
      });
  }

  protected logout() {
    this.account.clear();

    this.router
      .navigate(['/passport'])
      .then(() => {
        console.log('goLogin ok!')
      })
      .catch(e => {
        console.log('goLogin failed: ', e)
      });
  }
}
