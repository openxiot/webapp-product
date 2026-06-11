import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {MainService} from '../../../../service/main.service';
import {SpecDevice} from '../../../../typedef/define/spec/SpecDevice';
import {NzTableModule, NzTableQueryParams} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {LifeCycle} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'spec-device',
  standalone: true,
  templateUrl: './spec.device.component.html',
  styleUrls: ['./spec.device.component.less'],
  imports: [
    FormsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
  ],
})
export class SpecDeviceComponent implements OnInit {

  loading: boolean = true;
  total: number = 0;
  devices: SpecDevice[] = [];
  pageSize = 100;
  pageIndex = 1;

  constructor(
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  loadDataFromServer(
    pageIndex: number,
    pageSize: number,
  ): void {
    this.loading = true;
    this.service.getSpecDevices('jd', pageIndex, pageSize)
      .subscribe({
        next: data => {
          this.devices = data;
          this.loading = false;
          this.total = this.devices.length;
        },
        error: error => {
          this.msg.warning('Failed to getSpecDevices: ', error);
        }
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    const { pageSize, pageIndex } = params;
    this.loadDataFromServer(pageIndex, pageSize);
  }

  protected readonly LifeCycle = LifeCycle;
}
