import {Component, inject, OnInit} from '@angular/core';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import pkg from '../../../../package.json';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NoticeCardComponent} from './notice/card/notice.card.component';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {OrganizationService} from '../../service/organization.service';
import {CookieService} from 'ngx-cookie-service';
import {environment} from "../../../environments/environment";

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

  private cookie = inject(CookieService);

  passport: string = environment.passport.url;
  version: string = pkg.version;
  loading: boolean = true;

  pin: string = '?';
  nickname: string = '?';

  constructor(
    private organization: OrganizationService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    console.log('init');
    this.pin = this.cookie.get('pin');
    this.nickname = this.cookie.get('unick');
    console.log('pin: ', this.pin);
    console.log('nickname: ', this.nickname);
  }

  protected goto(path: string) {
  }

  protected logout() {
    console.log('logout: ', this.passport);
    window.location.href = this.passport;
  }

  name: string = '个人开发者';

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
}
