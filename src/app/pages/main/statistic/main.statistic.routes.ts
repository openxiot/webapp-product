import {Routes} from '@angular/router';
import {MainStatisticComponent} from './main.statistic.component';

export const MAIN_STATISTIC_ROUTES: Routes = [
  {
    path: '',
    data: {breadcrumb: '统计'},
    component: MainStatisticComponent,
    loadChildren: () => import('../../content/product/product.routes').then(m => m.PRODUCT_ROUTES)
  }
];
