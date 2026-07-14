import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {BreadcrumbTranslateDirective} from '../../../common/component/breadcrumb/breadcrumb-translate.directive';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzSegmentedComponent, NzSegmentedOptions} from 'ng-zorro-antd/segmented';
import {FormsModule} from '@angular/forms';
import {ProductGridComponent} from './view/grid/product.grid.component';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ProductListComponent} from './view/list/product.list.component';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AccountService} from '../../../service/account.service';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzModalService} from 'ng-zorro-antd/modal';
import {OrganizationOption} from '../../../common/dialog/organization/OrganizationOption';
import {OrganizationSelectorComponent} from '../../../common/dialog/organization/organization.selector.component';
import {Organization} from '../../../typedef/define/developer/Organization';

@Component({
  selector: 'main-product',
  standalone: true,
  templateUrl: './product.component.html',
  styleUrl: './product.component.less',
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    BreadcrumbTranslateDirective,
    NzSpinModule,
    NzSegmentedComponent,
    FormsModule,
    ProductGridComponent,
    ProductListComponent,
    NzRowDirective,
    NzColDirective,
    NzButtonComponent,
    NzWaveDirective,
    RouterLink,
    TranslatePipe,
    NzIconDirective,
  ],
  providers: [
    NzModalService
  ]
})
export class ProductComponent implements OnInit {

  viewOptions: NzSegmentedOptions = [
    {value: 'Card', icon: 'appstore'},
    {value: 'List', icon: 'bars'}
  ];
  viewMode: number = 0;

  current: Organization = new Organization();

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    protected account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
    this.loadProductViewMode();
  }

  ngOnInit() {
    if (this.account.organization) {
      this.current = this.account.organization;
    }
  }

  protected onViewModeChanged($event: any) {
    this.saveProductViewMode();
  }

  private loadProductViewMode() {
    const value = localStorage.getItem('productViewMode');
    if (value) {
      this.viewMode = Number.parseInt(value);
    }
  }

  private saveProductViewMode() {
    localStorage.setItem('productViewMode', this.viewMode.toString());
  }

  protected changeOrganization() {
    const modal = this.modal.create<OrganizationSelectorComponent, OrganizationOption, Organization>({
      nzTitle: '',
      nzWidth: 800,
      nzContent: OrganizationSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new OrganizationOption(this.current),
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.current = result;
      }
    });
  }
}
