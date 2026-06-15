import {Routes} from '@angular/router';
import {NamespaceComponent} from './namespace.component';
import {NamespaceCreateComponent} from './create/namespace.create.component';
import {NamespaceEditComponent} from './edit/namespace.edit.component';

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
  {
    path: 'edit/:ns',
    data: { breadcrumb: '修改' },
    component: NamespaceEditComponent
  },
];
