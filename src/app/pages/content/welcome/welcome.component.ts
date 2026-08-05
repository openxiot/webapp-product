import {Component, OnInit, signal} from '@angular/core';
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
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {Statistic} from '../../../typedef/define/statistic/Statistic';

@Component({
  selector: 'main-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.less',
  imports: [
    RouterLink,
    TranslatePipe,
    DecimalPipe,
    NzStatisticModule,
    NzRowDirective,
    NzColDirective,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzSpinModule,
  ]
})
export class WelcomeComponent implements OnInit {

  loading = signal(false);
  statistic = signal<Statistic>(new Statistic());

  constructor(
    public account: AccountService,
    private service: MainService,
    private router: Router,
    private route: ActivatedRoute,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.service.getStatistic().subscribe({
      next: data => {
        this.statistic.set(data);
        this.loading.set(false);
        console.log("getStatistic ok!");
      },
      error: error => {
        this.msg.warning(error);
        this.loading.set(false);
        console.log("getStatistic ok!");
      }
    });
  }
}
