import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
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

@Component({
  selector: 'main-product',
  standalone: true,
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
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
  ],
})
export class ProductComponent {

  viewOptions: NzSegmentedOptions = [
    {value: 'Card', icon: 'appstore'},
    {value: 'List', icon: 'bars'}
  ];
  viewMode: number = 0;

  constructor(
    private service: MainService,
    private msg: NzMessageService,
  ) {
    this.loadProductViewMode();
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
}
