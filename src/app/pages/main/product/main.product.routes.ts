import {Routes} from '@angular/router';
import {MainProductComponent} from './main.product.component';

export const MAIN_PRODUCT_ROUTES: Routes = [
  {
    path: '',
    data: {breadcrumb: '所有产品'},
    component: MainProductComponent,
    loadChildren: () => import('../../content/product/product.routes').then(m => m.PRODUCT_ROUTES)
  }
];
