import {Routes} from '@angular/router';
import {MainComponent} from './pages/main/main.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/main/product'
  },
  {
    path: 'main',
    data: {breadcrumb: '首页'},
    component: MainComponent,
    loadChildren: () => import('./pages/main/main.routes').then(m => m.MAIN_ROUTES)
  },
  {
    path: 'error',
    data: {breadcrumb: '错误'},
    loadChildren: () => import('./pages/error/error.routes').then(m => m.ERROR_ROUTES)
  },
  {
    path: 'passport',
    loadChildren: () => import('./pages/passport/passport.routes').then(m => m.PASSPORT_ROUTERS)
  }
];
