import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AccountService} from '../../../service/account.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {MainService} from '../../../service/main.service';
import {NzStatisticModule} from 'ng-zorro-antd/statistic';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {DecimalPipe} from '@angular/common';
import {NzCardModule} from 'ng-zorro-antd/card';
import {TranslatePipe} from '@ngx-translate/core';
import {NzIconModule} from 'ng-zorro-antd/icon';

@Component({
  selector: 'main-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.less'],
  imports: [
    TranslatePipe,
    DecimalPipe,
    NzStatisticModule,
    NzRowDirective,
    NzColDirective,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    RouterLink,
  ]
})
export class WelcomeComponent implements OnInit {

  constructor(
    public account: AccountService,
    private service: MainService,
    private router: Router,
    private route: ActivatedRoute,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
  }
}
