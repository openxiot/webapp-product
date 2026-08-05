import {Component, OnInit, signal, ViewContainerRef} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {BreadcrumbTranslateDirective} from '../../../common/component/breadcrumb/breadcrumb-translate.directive';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {SpecDeviceComponent} from './device/spec.device.component';
import {SpecServiceComponent} from './service/spec.service.component';
import {SpecPropertyComponent} from './property/spec.property.component';
import {SpecActionComponent} from './action/spec.action.component';
import {SpecEventComponent} from './event/spec.event.component';
import {SpecFormatComponent} from './format/spec.format.component';
import {SpecUnitComponent} from './unit/spec.unit.component';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {AccountService} from '../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NamespaceSelectorComponent} from '../../../common/dialog/namespace/namespace.selector.component';
import {MainI18nService} from '../../../service/i18n.service';
import {NamespaceDefinition} from '@openxiot/xiot-core-spec-ts';
import {NamespaceOption} from '../../../common/dialog/namespace/NamespaceOption';

@Component({
  selector: 'main-spec',
  standalone: true,
  templateUrl: './spec.component.html',
  styleUrl: './spec.component.less',
  imports: [
    FormsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    BreadcrumbTranslateDirective,
    NzSpinModule,
    NzCardModule,
    NzTabsModule,
    NzDescriptionsModule,
    SpecDeviceComponent,
    SpecServiceComponent,
    SpecPropertyComponent,
    SpecActionComponent,
    SpecEventComponent,
    SpecFormatComponent,
    SpecUnitComponent,
    NzSpaceModule,
    NzButtonModule,
    TranslatePipe,
    NzIconDirective,
  ],
  providers: [
    NzModalService
  ]
})
export class SpecComponent implements OnInit {

  tabIndex: number = 0;
  loading = signal(false);

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public account: AccountService,
    public i18n: MainI18nService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    const savedIndex = localStorage.getItem("specTabIndex") || '0';
    this.tabIndex = Number.parseInt(savedIndex);
  }

  protected onTabChanged() {
    localStorage.setItem("specTabIndex", this.tabIndex.toString());
  }

  protected changeNamespace(): void {
    const modal = this.modal.create<NamespaceSelectorComponent, NamespaceOption, NamespaceDefinition>({
      nzTitle: '',
      nzWidth: 800,
      nzContent: NamespaceSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new NamespaceOption(this.account.ns().namespace || ''),
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.account.ns.set(result);
      }
    });
  }
}
