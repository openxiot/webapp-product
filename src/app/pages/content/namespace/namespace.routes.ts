import {Routes} from '@angular/router';
import {NamespaceComponent} from './namespace.component';
import {NamespaceCreateComponent} from './create/namespace.create.component';

export const NAMESPACE_ROUTES: Routes = [
  {
    path: '',
    component: NamespaceComponent
  },
  {
    path: 'create',
    data: { breadcrumb: '创建' },
    component: NamespaceCreateComponent
  },
];
