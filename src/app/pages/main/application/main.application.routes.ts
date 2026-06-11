import {Routes} from '@angular/router';
import {MainApplicationComponent} from './main.application.component';

export const MAIN_APPLICATION_ROUTES: Routes = [
  {
    path: '',
    data: {breadcrumb: '应用'},
    component: MainApplicationComponent,
    loadChildren: () => import('../../content/product/product.routes').then(m => m.PRODUCT_ROUTES)
  }
];
