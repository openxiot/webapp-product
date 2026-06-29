import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {DeviceType, LifeCycle, Service} from '@openxiot/xiot-core-spec-ts';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {CreateServiceComponent} from '../../../../../../../common/dialog/instance/create/service/create.service.component';
import {ServiceType} from '@openxiot/xiot-core-spec-ts';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../../../service/i18n.service';

@Component({
  selector: 'instance-services',
  templateUrl: './instance.services.component.html',
  styleUrls: ['./instance.services.component.less'],
  standalone: true,
  imports: [
    NzTagComponent,
    NzMenuModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzDropDownModule,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class InstanceServicesComponent {

  protected readonly LifeCycle = LifeCycle;

  @Input() editable: boolean = false;
  @Input() showVersion: boolean = false;
  @Input() type!: DeviceType;
  @Input() services: Service[] = [];
  @Output() selected = new EventEmitter<Service>();
  @Output() serviceAdded = new EventEmitter<Service>();

  constructor(
    public i18n: MainI18nService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private msg: NzMessageService
  ) {
  }

  onClickService(s: Service) {
    this.selected.emit(s);
  }

  onAddService() {
    let siid: number = 1024;

    for (let service of this.services) {
      if (service.iid > siid) {
        siid = service.iid;
      }
    }

    siid ++;

    const org = this.type.organization || 'org';
    const model = this.type.model || 'model';
    const version = this.type.version || 0;
    const type = new ServiceType(`urn:${org}:service:unnamed:00000000:${org}:${model}:${version}`);
    const description = new Map<string, string>();
    description.set('zh-CN', '自定义功能');

    const modal = this.modal.create<CreateServiceComponent, Service, Service>({
      nzTitle: '添加功能',
      nzWidth: 1000,
      nzContent: CreateServiceComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new Service(siid, type, description, [], [], []),
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
        this.addService(result);
      }
    });
  }

  private addService(service: Service) {
    this.serviceAdded.emit(service);
  }
}
