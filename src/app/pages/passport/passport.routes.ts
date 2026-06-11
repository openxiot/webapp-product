import {Routes} from '@angular/router';
import {CallbackComponent} from './callback/callback.component';

export const PASSPORT_ROUTERS: Routes = [
  {
    path: 'callback',
    component: CallbackComponent,
  },
];
