import {Routes} from '@angular/router';
import {TemplateComponent} from './template.component';
import {TemplateDetailComponent} from './detail/template.detail.component';
import {TemplateNsComponent} from './ns/template.ns.component';

export const TEMPLATE_ROUTES: Routes = [
  {
    path: '',
    component: TemplateComponent
  },
  {
    path: 'ns',
    component: TemplateNsComponent
  },
  {
    path: 'detail/:type',
    data: { breadcrumb: '详情' },
    component: TemplateDetailComponent
  },
];
