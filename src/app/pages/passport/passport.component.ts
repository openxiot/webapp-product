import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NzContentComponent, NzHeaderComponent, NzLayoutComponent} from "ng-zorro-antd/layout";
import {NzMessageService} from "ng-zorro-antd/message";
import {MainService} from "../../service/main.service";
import {NzListModule} from "ng-zorro-antd/list";
import {Router} from "@angular/router";
import {AccountService} from "../../service/account.service";
import {NzDropDownDirective, NzDropdownMenuComponent} from "ng-zorro-antd/dropdown";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzMenuModule} from "ng-zorro-antd/menu";
import {MainI18nService} from "../../service/i18n.service";
import {NzCardModule} from "ng-zorro-antd/card";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzToolTipModule} from "ng-zorro-antd/tooltip";
import {NzButtonModule} from "ng-zorro-antd/button";
import {TranslatePipe} from "@ngx-translate/core";
import {Title} from "@angular/platform-browser";
import {NzCheckboxModule} from "ng-zorro-antd/checkbox";
import {NzSpaceModule} from "ng-zorro-antd/space";
import {Oauth2Configuration} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'passport',
  standalone: true,
  templateUrl: './passport.component.html',
  imports: [
    TranslatePipe,
    FormsModule,
    ReactiveFormsModule,
    NzLayoutComponent,
    NzHeaderComponent,
    NzContentComponent,
    NzListModule,
    NzDropDownDirective,
    NzIconDirective,
    NzDropdownMenuComponent,
    NzMenuModule,
    NzCardModule,
    NzRowDirective,
    NzColDirective,
    NzDividerModule,
    NzToolTipModule,
    NzButtonModule,
    NzCheckboxModule,
    NzSpaceModule
  ],
  styleUrls: ['./passport.component.less']
})
export class PassportComponent implements OnInit {

  loading: boolean = true;
  list: Oauth2Configuration[] = []
  config: Oauth2Configuration | undefined = undefined;
  redirectUrl: string = '';

  constructor(
    private router: Router,
    public i18n: MainI18nService,
    private title: Title,
    private msg: NzMessageService,
    private service: MainService,
    private account: AccountService,
  ) {
  }

  ngOnInit() {
    this.i18n.translate.onLangChange.subscribe(() => {
      this.setTitle();
    });
    this.setTitle();  // 初始化时也设置一次

    this.account.clear();
    this.loadOauth2Configurations();

    console.log('window: ', window);

    const baseUrl = window.location.href.split('#')[0];
    this.redirectUrl = baseUrl + '#passport/callback';
    console.log('redirectUrl: ' + this.redirectUrl);
  }

  setTitle() {
    console.log('CurrentLang: ', this.i18n.translate.getCurrentLang());
    console.log('BrowserLang: ', this.i18n.translate.getBrowserLang());
    this.i18n.translate.get('Openxiot').subscribe((res: string) => {
      this.title.setTitle(res);
    });
  }

  open(config: Oauth2Configuration): void {
    console.log('open: ', config);

    if (config.available) {
      const url = this.getAuthorizeURL(config.platformId);
      if (url == null) {
        this.msg.error('AuthorizeURL is null');
        return;
      }

      this.login(url);
    } else {
      this.msg.info('not implemented');
    }
  }

  private loadOauth2Configurations(): void {
    this.loading = true;

    this.service.getDeveloperPlatforms().subscribe({
      next: data => {
        this.list = data;
        this.config = data.find(x => x.platformId === 'github');
        this.loading = false;
      },
      error: error => {
        this.msg.warning('读取第三份账号平台失败: ' + error.message);
        this.loading = false;
      }
    });
  }

  private getAuthorizeURL(platformId: string): string | null {
    for (let i = 0; i < this.list.length; ++i) {
      const x = this.list[i];
      if (x.platformId === platformId) {
        return this.getOAuthURL(x);
      }
    }

    return null;
  }

  private getOAuthURL(x: Oauth2Configuration): string {
    console.log('callbackUrl', x.callbackUrl);

    let callback0 = decodeURIComponent(x.callbackUrl);
    let callback1 = encodeURIComponent(x.callbackUrl);
    let clientId = x.clientId;
    let url = x.authorizeUrl;

    const state = btoa(this.redirectUrl);
    console.log('state', state);

    switch (x.platformId) {
      case 'feishu': {
        return `${url}?app_id=${clientId}&redirect_uri=${callback0}&scope=passport:session_mask:readonly&state=${state}`;
      }

      case 'wechat': {
        return `${url}?appid=${clientId}&redirect_uri=${callback1}&response_type=code&scope=snsapi_login&state=${state}`;
      }

      case 'xiaomi': {
        return `${url}?client_id=${clientId}&response_type=code&redirect_uri=${callback0}&state=${state}`;
      }

      case 'google': {
        const scope = 'openid profile email';
        const include_granted_scopes = true;
        const response_type = 'code';
        const prompt = 'consent';
        return `${url}?client_id=${clientId}&response_type=${response_type}&redirect_uri=${callback0}&state=${state}&include_granted_scopes=${include_granted_scopes}&scope=${scope}&prompt=${prompt}`;
      }

      // github账号，需要scope=user:email才能拿到邮箱。
      case 'github':
      default: {
        const scope = 'user:email';
        return `${url}?client_id=${clientId}&response_type=code&redirect_uri=${callback0}&prompt=consent&scope=${scope}&state=${state}`;
      }
    }
  }

  private login(url: string,) {
    console.log('login: ', url);
    window.location.href = url;
  }
}
