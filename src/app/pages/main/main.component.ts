import {Component, OnInit, ViewContainerRef} from '@angular/core';
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
import {AccountService} from '../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../service/i18n.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {LanguageChangeComponent} from '../../common/dialog/language/change/language.change.component';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less'],
  standalone: true,
  imports: [
    TranslatePipe,
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
  ],
  providers: [
    NzModalService
  ]
})
export class MainComponent implements OnInit {

  docs: string = environment.docs;
  version: string = pkg.version;

  constructor(
    public account: AccountService,
    public i18n: MainI18nService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {
  }

  ngOnInit() {
    console.log('init');

    this.account.loadOrganizations();
  }

  protected changeLanguage() {
    this.modal.create<LanguageChangeComponent, string, string>({
      nzTitle: '',
      nzWidth: 1400,
      nzContent: LanguageChangeComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: '',
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });
  }

  protected goToDocs() {
    window.open(this.docs, '_blank');
  }
}
