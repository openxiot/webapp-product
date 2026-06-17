import {Component, OnDestroy, OnInit} from '@angular/core';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {RouterLink} from '@angular/router';
import {LifeCycle, ProductBasic} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {AccountService} from '../../../../../service/account.service';

@Component({
  selector: 'product-grid',
  standalone: true,
  templateUrl: './product.grid.component.html',
  styleUrls: ['./product.grid.component.less'],
  imports: [
    RouterLink,
    NzRowDirective,
    NzColDirective,
    NzCardModule,
    NzSpinModule,
    NzTagModule,
    NzDescriptionsModule,
    NzDividerModule,
  ],
})
export class ProductGridComponent implements OnInit, OnDestroy {

  // private subscription: any;
  loading: boolean = true;
  products: ProductBasic[] = [];

  constructor(
    private account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    // this.subscription = this.organization.data$.subscribe(data => {
    //   if (data) {
    //     this.loadProductsFromServer();
    //   }
    // });

    this.loadProductsFromServer();
  }

  ngOnDestroy() {
    // this.subscription.unsubscribe();
  }

  loadProductsFromServer() {
    this.loading = true;
    this.service.getAllProducts(this.account.organization).subscribe({
      next: data => {
        this.products = data;
        this.loading = false;
      },
      error: error => {
        this.msg.warning('Failed to getProducts', error);
      }
    })
  }

  protected readonly LifeCycle = LifeCycle;
}
