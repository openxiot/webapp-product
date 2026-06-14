import {Routes} from '@angular/router';
import {SpecComponent} from './spec.component';
import {SpecNsComponent} from './ns/spec.ns.component';
import {SpecDeviceCreateComponent} from './device/create/spec.device.create.component';
import {SpecServiceCreateComponent} from './service/create/spec.service.create.component';
import {SpecPropertyCreateComponent} from './property/create/spec.property.create.component';
import {SpecActionCreateComponent} from './action/create/spec.action.create.component';
import {SpecEventCreateComponent} from './event/create/spec.event.create.component';
import {SpecFormatCreateComponent} from './format/create/spec.format.create.component';
import {SpecUnitCreateComponent} from './unit/create/spec.unit.create.component';

export const SPEC_ROUTES: Routes = [
  {
    path: '',
    component: SpecComponent
  },
  {
    path: 'ns',
    component: SpecNsComponent
  },
  {
    path: 'device/create',
    component: SpecDeviceCreateComponent
  },
  {
    path: 'service/create',
    component: SpecServiceCreateComponent
  },
  {
    path: 'property/create',
    component: SpecPropertyCreateComponent
  },
  {
    path: 'action/create',
    component: SpecActionCreateComponent
  },
  {
    path: 'event/create',
    component: SpecEventCreateComponent
  },
  {
    path: 'format/create',
    component: SpecFormatCreateComponent
  },
  {
    path: 'unit/create',
    component: SpecUnitCreateComponent
  },
];
