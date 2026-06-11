import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {SpecDeviceComponent} from './device/spec.device.component';
import {SpecServiceComponent} from './service/spec.service.component';
import {SpecPropertyComponent} from './property/spec.property.component';
import {SpecActionComponent} from './action/spec.action.component';
import {SpecEventComponent} from './event/spec.event.component';
import {SpecFormatComponent} from './format/spec.format.component';
import {SpecUnitComponent} from './unit/spec.unit.component';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzRadioComponent, NzRadioGroupComponent} from 'ng-zorro-antd/radio';

@Component({
  selector: 'main-spec',
  standalone: true,
  templateUrl: './spec.component.html',
  styleUrls: ['./spec.component.less'],
  imports: [
    FormsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzTabsModule,
    NzDescriptionsModule,
    SpecDeviceComponent,
    SpecServiceComponent,
    SpecPropertyComponent,
    SpecActionComponent,
    SpecEventComponent,
    SpecFormatComponent,
    SpecUnitComponent,
    NzRadioComponent,
    NzRadioGroupComponent,
  ],
})
export class SpecComponent implements OnInit {

  tabIndex: number = 0;
  language: string = 'zh-CN'

  constructor(
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
  }
}
