import {Component, Input, ViewContainerRef} from '@angular/core';
import {ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzSpaceComponent, NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'template-service-header',
  templateUrl: './template.service.header.component.html',
  styleUrls: ['./template.service.header.component.less'],
  standalone: true,
  imports: [
    NzTabsModule,
    NzIconDirective,
    NzSpaceComponent,
    NzCardModule,
    NzDescriptionsModule,
    NzSpaceModule,
    NzTagModule,
    NzTableModule,
    NzDividerComponent,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateServiceHeaderComponent {

  @Input() version: boolean = false;
  @Input() service!: ServiceTemplate;
  @Input() language: string = 'zh-CN';
  // @Output() changed = new EventEmitter<Service>();
  // @Output() removed = new EventEmitter<Service>();

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public msg: NzMessageService
  ) {
  }

  onRemove(service: ServiceTemplate) {
  //   const modal = this.modal.create<ConfirmComponent, string, string>({
  //     nzTitle: '您真的要删除这个功能组吗？',
  //     nzContent: ConfirmComponent,
  //     nzViewContainerRef: this.viewContainerRef,
  //     nzData: service.description.get(this.language),
  //     nzFooter: [
  //       {
  //         label: '取消',
  //         onClick: component => component!.cancel()
  //       },
  //       {
  //         label: '确认',
  //         danger: true,
  //         type: 'primary',
  //         onClick: component => component!.ok()
  //       }
  //     ],
  //   });
  //
  //   modal.afterClose.subscribe(result => {
  //     if (result) {
  //       this.removed.emit(service);
  //     }
  //   });
  }

  onEdit(service: ServiceTemplate) {
  //   const modal = this.modal.create<EditServiceComponent, EditableService, Service>({
  //     nzTitle: '修改功能组',
  //     nzContent: EditServiceComponent,
  //     nzViewContainerRef: this.viewContainerRef,
  //     nzData: new EditableService(service),
  //     nzFooter: [
  //       {
  //         label: '修改',
  //         danger: true,
  //         type: 'primary',
  //         disabled: component => component!.disabled || false,
  //         onClick: component => component!.ok()
  //       }
  //     ],
  //     nzDraggable: true,
  //   });
  //
  //   modal.afterClose.subscribe(result => {
  //     if (result) {
  //     }
  //   });
  }
  //
  // getWidthConfig() {
  //   return (this.version) ? ['32px', '128px', '352px', '32px', '24px'] : ['32px', '128px', '384px', '24px'];
  // }
}
