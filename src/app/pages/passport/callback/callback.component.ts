import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {CookieService} from 'ngx-cookie-service';
import {environment} from '../../../../environments/environment';
import {NzSpinModule} from 'ng-zorro-antd/spin';

@Component({
  selector: 'passport-callback',
  templateUrl: './callback.component.html',
  standalone: true,
  imports: [
    NzSpinModule,
  ],
  providers: [
    CookieService
  ]
})
export class CallbackComponent implements OnInit {

  private cookie = inject(CookieService);

  loading: boolean = true;
  logged: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: MainService,
    private msg: NzMessageService
  ) {
  }

  ngOnInit() {
    console.log('init');
    // 使用Cookie，直接读取用户信息，读完后跳转到首页
    this.getProfile();
  }

  private getProfile() {
    const pin = this.cookie.get('pin');

    this.logged = !!pin;
    this.loading = false;

    if (this.logged) {
      this.router.navigate(['/main/product'])
        .then(x => {
          console.log('navigate ok!');
        })
        .catch(e => {
          console.log('navigate failed: ', e);
        });
    } else {
      window.location.href = environment.passport.url;
    }
  }
}
