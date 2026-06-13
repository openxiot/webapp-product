import {Routes} from '@angular/router';
import {OrganizationComponent} from './organization.component';
import {OrganizationCreateComponent} from './create/organization.create.component';

export const ORGANIZATION_ROUTES: Routes = [
  {
    path: '',
    component: OrganizationComponent
  },
  {
    path: 'create',
    data: { breadcrumb: '创建' },
    component: OrganizationCreateComponent
  },
];
