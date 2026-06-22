import {Routes} from '@angular/router';
import {TemplateComponent} from './template.component';
import {TemplateDetailComponent} from './detail/template.detail.component';
import {TemplateNsComponent} from './ns/template.ns.component';
import {TemplateCreateComponent} from './create/template.create.component';

export const TEMPLATE_ROUTES: Routes = [
  {
    path: '',
    component: TemplateComponent
  },
  {
    path: 'ns',
    data: { breadcrumb: '名字空间' },
    component: TemplateNsComponent
  },
  {
    path: 'create',
    data: { breadcrumb: '创建' },
    component: TemplateCreateComponent
  },
  {
    path: 'detail/:type',
    data: { breadcrumb: '详情' },
    component: TemplateDetailComponent
  },
];
