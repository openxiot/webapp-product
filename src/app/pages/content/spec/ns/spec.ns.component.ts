import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {BreadcrumbTranslateDirective} from '../../../../common/component/breadcrumb/breadcrumb-translate.directive';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {MainService} from '../../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {AccountService} from '../../../../service/account.service';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {MainI18nService} from '../../../../service/i18n.service';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {Router} from '@angular/router';
import {NamespaceDefinition} from '@openxiot/xiot-core-spec-ts';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'spec-ns',
  standalone: true,
  templateUrl: './spec.ns.component.html',
  styleUrls: ['./spec.ns.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    BreadcrumbTranslateDirective,
    NzSpinModule,
    NzCardModule,
    NzIconModule,
    NzSpaceModule,
    NzRowDirective,
    NzColDirective,
    TranslatePipe
  ],
})
export class SpecNsComponent implements OnInit {

  loading: boolean = true;
  namespaces: NamespaceDefinition[] = [];

  constructor(
    private router: Router,
    public i18n: MainI18nService,
    public account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadNamespaces();
  }

  private loadNamespaces() {
    this.service.getAllNamespaces(this.account.organization)
      .subscribe({
        next: data => {
          this.namespaces = data;
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected select(ns: NamespaceDefinition) {
    this.account.ns = ns;
    this.router.navigate(['/main/spec']).then(() => {});
  }
}
