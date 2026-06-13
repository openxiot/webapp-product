import {Routes} from '@angular/router';
import {SpecComponent} from './spec.component';
import {SpecNsComponent} from './ns/spec.ns.component';

export const SPEC_ROUTES: Routes = [
  {
    path: '',
    component: SpecComponent
  },
  {
    path: 'ns',
    component: SpecNsComponent
  },
];
