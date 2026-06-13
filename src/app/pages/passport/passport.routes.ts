import {Routes} from '@angular/router';
import {PassportComponent} from './passport.component';
import {CallbackComponent} from './callback/callback.component';

export const PASSPORT_ROUTERS: Routes = [
  {
    path: '',
    component: PassportComponent
  },
  {
    path: 'callback',
    component: CallbackComponent,
  },
];
