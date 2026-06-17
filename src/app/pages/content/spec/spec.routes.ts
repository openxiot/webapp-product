import {Routes} from '@angular/router';
import {SpecComponent} from './spec.component';
import {SpecNsComponent} from './ns/spec.ns.component';
import {SpecDeviceCreateComponent} from './device/create/spec.device.create.component';
import {SpecDeviceEditComponent} from './device/edit/spec.device.edit.component';
import {SpecServiceCreateComponent} from './service/create/spec.service.create.component';
import {SpecPropertyCreateComponent} from './property/create/spec.property.create.component';
import {SpecPropertyEditComponent} from './property/edit/spec.property.edit.component';
import {SpecPropertyViewComponent} from './property/view/spec.property.view.component';
import {SpecActionCreateComponent} from './action/create/spec.action.create.component';
import {SpecActionEditComponent} from './action/edit/spec.action.edit.component';
import {SpecActionViewComponent} from './action/view/spec.action.view.component';
import {SpecEventCreateComponent} from './event/create/spec.event.create.component';
import {SpecFormatCreateComponent} from './format/create/spec.format.create.component';
import {SpecUnitCreateComponent} from './unit/create/spec.unit.create.component';
import {SpecFormatEditComponent} from './format/edit/spec.format.edit.component';
import {SpecUnitEditComponent} from './unit/edit/spec.unit.edit.component';

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
    path: 'device/edit/:type',
    data: { breadcrumb: '设备' },
    component: SpecDeviceEditComponent
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
    path: 'property/edit/:type',
    data: { breadcrumb: '属性' },
    component: SpecPropertyEditComponent
  },
  {
    path: 'property/view/:type',
    data: { breadcrumb: '属性' },
    component: SpecPropertyViewComponent
  },
  {
    path: 'action/create',
    data: { breadcrumb: '方法' },
    component: SpecActionCreateComponent
  },
  {
    path: 'action/edit/:type',
    data: { breadcrumb: '方法' },
    component: SpecActionEditComponent
  },
  {
    path: 'action/view/:type',
    data: { breadcrumb: '方法' },
    component: SpecActionViewComponent
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
    path: 'format/edit/:type',
    data: { breadcrumb: '格式' },
    component: SpecFormatEditComponent
  },
  {
    path: 'unit/create',
    data: { breadcrumb: '单位' },
    component: SpecUnitCreateComponent
  },
  {
    path: 'unit/edit/:type',
    data: { breadcrumb: '单位' },
    component: SpecUnitEditComponent
  },
];
