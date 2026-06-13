import {Component, inject, OnInit} from '@angular/core';
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
import {OrganizationService} from '../../service/organization.service';
import {CookieService} from 'ngx-cookie-service';
import {AccountService} from '../../service/account.service';

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
  ],
  providers: [
    CookieService
  ]
})
export class MainComponent implements OnInit {

  version: string = pkg.version;
  loading: boolean = true;
  name: string = '个人开发者';

  constructor(
    public account: AccountService,
    private router: Router,
    private organization: OrganizationService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    console.log('init');
  }

  protected goto(path: string) {
  }

  protected onSelect(name: string) {
    console.log('onSelect', name);

    this.name = name;

    // 主模块
    if (name === '个人开发者') {
      this.organization.update('personal');
    } else {
      this.organization.update('jd');
    }
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
