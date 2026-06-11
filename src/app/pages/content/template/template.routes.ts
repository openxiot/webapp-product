import {Routes} from '@angular/router';
import {TemplateComponent} from './template.component';
import {TemplateDetailComponent} from './detail/template.detail.component';

export const TEMPLATE_ROUTES: Routes = [
  {
    path: '',
    component: TemplateComponent
  },
  {
    path: 'detail/:type',
    data: { breadcrumb: '详情' },
    component: TemplateDetailComponent
  },
];
