import {Component, OnDestroy, OnInit} from '@angular/core';
import {NzTableFilterFn, NzTableModule, NzTableQueryParams, NzTableSortFn} from 'ng-zorro-antd/table';
import {RouterLink} from '@angular/router';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {LifeCycle, ProductBasic} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzImageModule} from 'ng-zorro-antd/image';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {MainService} from '../../../../../service/main.service';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-list',
  standalone: true,
  templateUrl: './product.list.component.html',
  styleUrls: ['./product.list.component.less'],
  imports: [
    FormsModule,
    RouterLink,
    NzInputModule,
    NzTableModule,
    NzButtonModule,
    NzDividerModule,
    NzIconModule,
    NzImageModule,
    NzTagModule,
    NzDropDownModule,
    NzColDirective,
    NzRowDirective,
    NzCardModule,
    NzCheckboxModule,
    TranslatePipe
  ],
})
export class ProductListComponent implements OnInit, OnDestroy {

  // private subscription: any;

  basicChecked: boolean = true;
  wizardChecked: boolean = true;
  instanceChecked: boolean = true;
  panelChecked: boolean = true;
  firmwareChecked: boolean = true;
  manualChecked: boolean = true;
  visibilityChecked: boolean = false;

  loading: boolean = true;
  total: number = 0;
  products: ProductBasic[] = [];
  pageSize = 100;
  pageIndex = 1;
  pageSizeOptions = [10, 50, 100, 200, 500];

  // nameSortFn: NzTableSortFn<ProductBasic> = (a: ProductBasic, b: ProductBasic): number => a.name.localeCompare(b.name);
  // searchNameValue = '';
  // visible = false;
  //
  // typeSortFn: NzTableSortFn<ProductBasic> = (a: ProductBasic, b: ProductBasic): number => a.name.localeCompare(b.name);
  // typeFilters = [
  //   {
  //     text: 'aaa', value: "a"
  //   },
  //   {
  //     text: 'bbb', value: "b"
  //   }
  // ]
  // typeFilterFn: NzTableFilterFn<ProductBasic> = (list: string[], a: ProductBasic) => list.some(name => a.name.includes(name));
  //
  // protocolSortFn: NzTableSortFn<ProductBasic> = (a: ProductBasic, b: ProductBasic): number => a.name.original.value(b.name);
  // protocolFilters = [
  //   {
  //     text: 'aaa', value: "a"
  //   },
  //   {
  //     text: 'bbb', value: "b"
  //   }
  // ]
  // protocolFilterFn: NzTableFilterFn<ProductBasic> = (list: string[], a: ProductBasic) => list.some(name => a.name.includes(name));
  //
  // upgradeSortFn: NzTableSortFn<ProductBasic> = (a: ProductBasic, b: ProductBasic): number => a.name.localeCompare(b.name);
  // upgradeFilters = [
  //   {
  //     text: 'aaa', value: "a"
  //   },
  //   {
  //     text: 'bbb', value: "b"
  //   }
  // ]
  // upgradeFilterFn: NzTableFilterFn<ProductBasic> = (list: string[], a: ProductBasic) => list.some(name => a.name.includes(name));
  //
  // templateSortFn: NzTableSortFn<ProductBasic> = (a: ProductBasic, b: ProductBasic): number => a.name.localeCompare(b.name);
  // templateFilters = [
  //   {
  //     text: 'aaa', value: "a"
  //   },
  //   {
  //     text: 'bbb', value: "b"
  //   }
  // ]
  // templateFilterFn: NzTableFilterFn<ProductBasic> = (list: string[], a: ProductBasic) => list.some(name => a.name.includes(name));
  //
  // basicLifecycleSortFn: NzTableSortFn<ProductBasic> = (a: ProductBasic, b: ProductBasic): number => a.name.localeCompare(b.name);
  // basicLifecycleFilters = [
  //   {
  //     text: 'aaa', value: "a"
  //   },
  //   {
  //     text: 'bbb', value: "b"
  //   }
  // ]
  // basicLifecycleFilterFn: NzTableFilterFn<ProductBasic> = (list: string[], a: ProductBasic) => list.some(name => a.name.includes(name));

  constructor(
    private account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    // this.loadProductsFromServer(this.pageIndex, this.pageSize);
    // 无需加载，因为onQueryParamsChange会被触发。

    // this.subscription = this.organization.data$.subscribe(data => {
    //   if (data) {
    //     this.loadProductsFromServer(this.pageIndex, this.pageSize);
    //   }
    // });
  }

  ngOnDestroy() {
    // this.subscription.unsubscribe();
  }

  loadProductsFromServer(
    pageIndex: number,
    pageSize: number,
  ) {
    this.loading = true;
    this.service.getAllProducts(this.account.organization).subscribe({
      next: data => {
        this.products = data;
        this.loading = false;
      },
      error: error => {
        this.msg.warning(error);
      }
    })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    const { pageSize, pageIndex } = params;
    this.loadProductsFromServer(pageIndex, pageSize);
  }

  resetName(): void {
    // this.searchNameValue = '';
    this.searchName();
  }

  searchName(): void {
    // this.visible = false;
    // this.listOfDisplayData = this.listOfData.filter((item: DataItem) => item.name.indexOf(this.searchValue) !== -1);
  }

  protected readonly LifeCycle = LifeCycle;
}
