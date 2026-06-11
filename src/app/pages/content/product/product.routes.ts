import {Routes} from '@angular/router';
import {ProductComponent} from './product.component';
import {ProductDetailComponent} from './detail/product.detail.component';
import {CreateComponent} from './create/create.component';
import {ProductPanelViewComponent} from './detail/panel/view/product.panel.view.component';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    component: ProductComponent
  },
  {
    path: 'create',
    data: { breadcrumb: '创建' },
    component: CreateComponent
  },
  {
    path: 'detail/:productId',
    data: { breadcrumb: '详情' },
    component: ProductDetailComponent
  },
  {
    path: 'detail/:productId/panel',
    data: { breadcrumb: '控制页' },
    component: ProductPanelViewComponent
  },
];
