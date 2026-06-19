import {Component, OnInit} from '@angular/core';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import pkg from '../../../../package.json';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {CookieService} from 'ngx-cookie-service';
import {AccountService} from '../../service/account.service';
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
    TranslatePipe,
  ],
  providers: [
    CookieService
  ]
})
export class MainComponent implements OnInit {

  version: string = pkg.version;

  constructor(
    public account: AccountService,
    public i18n: MainI18nService,
  ) {
  }

  ngOnInit() {
    console.log('init');

    this.account.loadOrganizations();
  }
}
