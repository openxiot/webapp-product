import {Component, OnInit, signal} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRoute, Router} from "@angular/router";
import {NzI18nService} from "ng-zorro-antd/i18n";
import {AccountService} from "../../../service/account.service";
import {Developer} from '../../../typedef/define/developer/Developer';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'passport-callback',
  templateUrl: './callback.component.html',
  standalone: true,
  imports: [
    NzSpinModule,
    TranslatePipe,
  ],
})
export class CallbackComponent implements OnInit {

  loading = signal(true);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private account: AccountService,
    public i18n: NzI18nService,
    public msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    console.log('CallbackComponent params: ', this.route.snapshot.params);
    console.log('CallbackComponent query: ', this.route.snapshot.queryParams);
    this.getProfile();
  }

  private getProfile() {
    let token = this.route.snapshot.queryParams['token'];
    let id = this.route.snapshot.queryParams['uid'];
    let name = this.route.snapshot.queryParams['name'];
    let avatar = this.route.snapshot.queryParams['avatar'];
    let email = this.route.snapshot.queryParams['email'];
    let platform = this.route.snapshot.queryParams['platform'];
    this.save(token, name, avatar, email, id, platform);
  }

  private save(token: string, name: string, avatar: string, email: string, id: string, platform: string) {
    const developer: Developer = new Developer();
    developer.name = name;
    developer.uid = id;
    developer.avatar = avatar;
    developer.email = email;
    developer.token = token;
    developer.platform = platform;

    console.info('name: ', developer.name);
    console.info('uid: ', developer.uid);
    console.info('avatar: ', developer.avatar);
    console.info('email: ', developer.email);
    console.info('token: ', developer.token);
    console.info('platform: ', developer.platform);

    this.account.setDeveloper(developer);

    if (developer.token !== null) {
      this.router.navigate(['/main'])
        .then(() => {
          this.loading.set(false);
        });
    } else {
      this.msg.info('登录失败, token is null');
    }
  }
}
