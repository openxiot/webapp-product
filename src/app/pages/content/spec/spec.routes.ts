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
    data: { breadcrumb: '名字空间' },
    component: SpecNsComponent
  },
  {
    path: 'device/create',
    data: { breadcrumb: '设备' },
    component: SpecDeviceCreateComponent
  },
  {
    path: 'service/create',
    data: { breadcrumb: '功能' },
    component: SpecServiceCreateComponent
  },
  {
    path: 'property/create',
    data: { breadcrumb: '属性' },
    component: SpecPropertyCreateComponent
  },
  {
    path: 'action/create',
    data: { breadcrumb: '方法' },
    component: SpecActionCreateComponent
  },
  {
    path: 'event/create',
    data: { breadcrumb: '事件' },
    component: SpecEventCreateComponent
  },
  {
    path: 'format/create',
    data: { breadcrumb: '格式' },
    component: SpecFormatCreateComponent
  },
  {
    path: 'unit/create',
    data: { breadcrumb: '单位' },
    component: SpecUnitCreateComponent
  },
];
