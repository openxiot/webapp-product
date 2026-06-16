import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {AccountService} from '../../../service/account.service';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'main-account',
  standalone: true,
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzTabsModule,
    NzDescriptionsModule,
    NzAvatarModule,
    NzIconModule,
    TranslatePipe
  ],
})
export class AccountComponent implements OnInit {

  constructor(
    public account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
  }
}
