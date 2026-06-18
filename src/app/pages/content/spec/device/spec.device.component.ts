import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {MainService} from '../../../../service/main.service';
import {NzTableModule, NzTableSortFn} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {DeviceDefinition, LifeCycle} from '@openxiot/xiot-core-spec-ts';
import {AccountService} from '../../../../service/account.service';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {RouterLink} from '@angular/router';
import {ConfirmComponent} from '../../../../common/dialog/confirm/confirm.component';
import {NzModalService} from 'ng-zorro-antd/modal';

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
    NzDividerComponent,
    RouterLink,
  ],
  providers: [
    NzModalService
  ],
})
export class SpecDeviceComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;

  loading: boolean = true;
  devices: DeviceDefinition[] = [];

  uuidSortFn: NzTableSortFn<DeviceDefinition> = (a: DeviceDefinition, b: DeviceDefinition): number => a.type.value - b.type.value;
  codeSortFn: NzTableSortFn<DeviceDefinition> = (a: DeviceDefinition, b: DeviceDefinition): number => a.type.name.localeCompare(b.type.name);

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    if (this.account.ns) {
      this.loadDataFromServer();
    }
  }

  loadDataFromServer(): void {
    this.loading = true;
    this.service.getDeviceDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.devices = data;
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected onDelete(device: DeviceDefinition) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: '您真的要删除这个设备类型吗？',
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: device.type.toString(),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '确认',
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.doDelete(device);
      }
    });
  }

  protected doDelete(device: DeviceDefinition) {
    this.loading = true;
    this.service.deleteDeviceDefinition(device.type)
      .subscribe({
        next: data => {
          this.devices = this.devices.filter(x => x.type.name !== device.type.name);
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }
}
