import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {DeviceTemplate, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'template-detail-service-group',
  templateUrl: './detail.service.group.component.html',
  styleUrls: ['./detail.service.group.component.less'],
  standalone: true,
  imports: [
    NzTagComponent,
    NzMenuModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzDropDownModule,
    TranslatePipe
  ],
  providers: [
    NzModalService
  ],
})
export class DetailServiceGroupComponent {

  @Input() version: boolean = false;
  @Input() device: DeviceTemplate | undefined = undefined;
  @Input() language: string = 'zh-CN';
  @Output() selected = new EventEmitter<ServiceTemplate>();

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private msg: NzMessageService
  ) {
  }

  onClickService(s: ServiceTemplate) {
    this.selected.emit(s);
  }

  onAddService() {
    // const modal = this.modal.create<CreateServiceComponent, string, ServiceTemplate>({
    //   nzTitle: '创建一个新功能组',
    //   nzWidth: 1000,
    //   nzContent: CreateServiceComponent,
    //   nzViewContainerRef: this.viewContainerRef,
    //   nzData: this.language,
    //   nzFooter: [
    //     {
    //       label: '取消',
    //       onClick: component => component!.cancel()
    //     },
    //     {
    //       label: '确认',
    //       danger: true,
    //       type: 'primary',
    //       onClick: component => component!.ok()
    //     }
    //   ],
    // });
    //
    // modal.afterClose.subscribe(result => {
    //   if (result) {
    //     // todo
    //   }
    // });
  }
}
