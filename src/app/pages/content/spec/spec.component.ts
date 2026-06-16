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
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {RouterLink} from '@angular/router';
import {AccountService} from '../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {NzIconDirective} from 'ng-zorro-antd/icon';

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
    NzSpaceModule,
    NzButtonModule,
    RouterLink,
    TranslatePipe,
    NzIconDirective,
  ],
})
export class SpecComponent implements OnInit {

  tabIndex: number = 0;
  language: string = 'zh-CN'

  constructor(
    public account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    const savedIndex = localStorage.getItem("specTabIndex") || '0';
    this.tabIndex = Number.parseInt(savedIndex);
  }

  protected onTabChanged() {
    localStorage.setItem("specTabIndex", this.tabIndex.toString());
  }
}
