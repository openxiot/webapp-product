import {Routes} from '@angular/router';

export const MAIN_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/main/welcome'
  },
  {
    path: 'welcome',
    data: {breadcrumb: '首页'},
    loadChildren: () => import('../content/welcome/welcome.routes').then(m => m.WELCOME_ROUTES)
  },
  {
    path: 'product',
    data: {breadcrumb: '产品'},
    loadChildren: () => import('./product/main.product.routes').then(m => m.MAIN_PRODUCT_ROUTES)
  },
  {
    path: 'statistic',
    data: {breadcrumb: '统计'},
    loadChildren: () => import('./statistic/main.statistic.routes').then(m => m.MAIN_STATISTIC_ROUTES)
  },
  {
    path: 'application',
    data: {breadcrumb: '应用'},
    loadChildren: () => import('./application/main.application.routes').then(m => m.MAIN_APPLICATION_ROUTES)
  },
  {
    path: 'spec',
    data: {breadcrumb: '产品规范'},
    loadChildren: () => import('../content/spec/spec.routes').then(m => m.SPEC_ROUTES)
  },
  {
    path: 'template',
    data: {breadcrumb: '产品模板'},
    loadChildren: () => import('../content/template/template.routes').then(m => m.TEMPLATE_ROUTES)
  },
  {
    path: 'upload',
    data: {breadcrumb: '上传'},
    loadChildren: () => import('./upload/upload.routes').then(m => m.UPLOAD_ROUTES)
  },
];
