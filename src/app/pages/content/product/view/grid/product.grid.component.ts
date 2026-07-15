import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
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
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../service/i18n.service';

@Component({
  selector: 'product-grid',
  standalone: true,
  templateUrl: './product.grid.component.html',
  styleUrl: './product.grid.component.less',
  imports: [
    RouterLink,
    NzRowDirective,
    NzColDirective,
    NzCardModule,
    NzSpinModule,
    NzTagModule,
    NzDescriptionsModule,
    NzDividerModule,
    TranslatePipe,
  ],
})
export class ProductGridComponent implements OnInit, OnDestroy, OnChanges {

  protected readonly LifeCycle = LifeCycle;

  @Input()
  products: ProductBasic[] = [];

  constructor(
    private account: AccountService,
    private service: MainService,
    public i18n: MainI18nService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    // this.loadProductsFromServer();
  }

  ngOnDestroy() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges');

    if (changes['products']) {
      console.log('products: ', this.products.length);
      // console.log('ngOnChanges: ', changes['organization']);
      // this.loadProductsFromServer();
    }
  }

  // loadProductsFromServer() {
  //   if (this.organization.id.length > 0) {
  //     this.loading = true;
  //     this.service.getAllProducts(this.organization).subscribe({
  //       next: data => {
  //         console.log('products: ', data.length);
  //         this.products = data;
  //         this.loading = false;
  //       },
  //       error: error => {
  //         this.msg.warning(error);
  //       }
  //     })
  //   }
  // }
}
