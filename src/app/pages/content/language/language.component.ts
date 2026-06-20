import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {BreadcrumbTranslateDirective} from '../../../common/component/breadcrumb/breadcrumb-translate.directive';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {AccountService} from '../../../service/account.service';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {MainI18nService} from '../../../service/i18n.service';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {Location} from '@angular/common';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

@Component({
  selector: 'main-language',
  standalone: true,
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    BreadcrumbTranslateDirective,
    NzSpinModule,
    NzCardModule,
    NzIconModule,
    NzSpaceModule,
    TranslatePipe,
    NzColDirective,
    NzRowDirective
  ],
})
export class LanguageComponent implements OnInit {

  constructor(
    private router: Router,
    private location: Location,
    public i18n: MainI18nService,
    public account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
  }

  protected changeLanguage(code: string): void {
    this.i18n.changeLanguage(code)
    this.location.back();
  }
}
