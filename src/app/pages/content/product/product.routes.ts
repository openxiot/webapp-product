import {Routes} from '@angular/router';
import {ProductComponent} from './product.component';
import {ProductDetailComponent} from './detail/product.detail.component';
import {ProductCreateComponent} from './create/product.create.component';
import {ProductControllerViewComponent} from './detail/controller/view/product.controller.view.component';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    component: ProductComponent
  },
  {
    path: 'create',
    data: { breadcrumb: '创建' },
    component: ProductCreateComponent
  },
  {
    path: 'detail/:productId',
    data: { breadcrumb: '详情' },
    component: ProductDetailComponent
  },
  {
    path: 'detail/:productId/controller',
    data: { breadcrumb: '控制页' },
    component: ProductControllerViewComponent
  },
];
