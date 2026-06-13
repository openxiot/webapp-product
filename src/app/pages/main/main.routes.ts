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
    path: 'template',
    data: {breadcrumb: '模板'},
    loadChildren: () => import('../content/template/template.routes').then(m => m.TEMPLATE_ROUTES)
  },
  {
    path: 'spec',
    data: {breadcrumb: '规范'},
    loadChildren: () => import('../content/spec/spec.routes').then(m => m.SPEC_ROUTES)
  },
  {
    path: 'namespace',
    data: {breadcrumb: '名字空间'},
    loadChildren: () => import('../content/namespace/namespace.routes').then(m => m.NAMESPACE_ROUTES)
  },
  {
    path: 'organization',
    data: {breadcrumb: '组织'},
    loadChildren: () => import('../content/organization/organization.routes').then(m => m.ORGANIZATION_ROUTES)
  },
  {
    path: 'account',
    data: {breadcrumb: '账号'},
    loadChildren: () => import('../content/account/account.routes').then(m => m.ACCOUNT_ROUTES)
  },
  {
    path: 'language',
    data: {breadcrumb: '语言'},
    loadChildren: () => import('../content/language/language.routes').then(m => m.LANGUAGE_ROUTES)
  },
];
