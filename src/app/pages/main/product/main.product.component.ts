import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ProductBasic} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {KeyValuePipe} from '@angular/common';
import pkg from '../../../../../package.json';
import {OrganizationService} from '../../../service/organization.service';

@Component({
  selector: 'main-product',
  standalone: true,
  templateUrl: './main.product.component.html',
  styleUrls: ['./main.product.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    FormsModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    RouterLink,
    NzCardModule,
    KeyValuePipe,
  ],
})
export class MainProductComponent implements OnInit, OnDestroy {

  private subscription: any;
  version: string = pkg.version;
  loading: boolean = true;
  products: Map<string, ProductBasic[]> = new Map<string, ProductBasic[]>();
  menuState: { [key: string]: boolean } = {};

  constructor(
    private organization: OrganizationService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.subscription = this.organization.data$.subscribe(data => {
      if (data) {
        this.load();
      }
    });
  }

  private load() {
    this.loadProductFromServer();
    this.loadProductMenuState();
  }

  ngOnDestroy() {
    this.saveProductMenuState();
    this.subscription.unsubscribe();
  }

  // // 子模块（需要监听 storage 事件）
  // @HostListener('window:storage', ['$event'])
  // onStorageChange(event: StorageEvent) {
  //   console.log('onStorageChange: ', event.key)
  //   if (event.key === 'organization') {
  //     this.organization = event.newValue || '?';
  //   }
  // }

  loadProductFromServer() {
    this.loading = true;
    this.service.getProducts(this.organization.code.value).subscribe({
      next: data => {
        this.products.clear();

        for (let product of data) {
          let list = this.products.get(product.template.name);
          if (! list) {
            list = [];
            this.products.set(product.template.name, list);
          }

          list.push(product);
        }

        this.loading = false;
      },
      error: error => {
        this.msg.warning('Failed to getProducts', error);
      }
    })
  }

  // 加载菜单状态
  private loadProductMenuState() {
    const savedState = localStorage.getItem('productMenuState');
    if (savedState) {
      this.menuState = JSON.parse(savedState);
    }
  }

  // 保存菜单状态
  private saveProductMenuState() {
    localStorage.setItem('productMenuState', JSON.stringify(this.menuState));
  }

  // 处理菜单展开/收起状态变化
  onMenuOpenChange(menuKey: string, isOpen: boolean) {
    this.menuState[menuKey] = isOpen;
    this.saveProductMenuState(); // 实时保存
  }

  // 获取菜单状态
  getMenuState(menuKey: string): boolean {
    return this.menuState[menuKey] || false;
  }
}
