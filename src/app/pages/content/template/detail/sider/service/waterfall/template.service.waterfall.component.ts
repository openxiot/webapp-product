import {Component, Input, ViewContainerRef} from '@angular/core';
import {ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzTableModule} from 'ng-zorro-antd/table';
import {TemplateServiceHeaderComponent} from './header/template.service.header.component';
import {TemplateTableEventsComponent} from './tables/events/template.table.events.component';
import {TemplateTableActionsComponent} from './tables/actions/template.table.actions.component';
import {TemplateTablePropertiesComponent} from './tables/properties/template.table.properties.component';

@Component({
  selector: 'template-service-waterfall',
  templateUrl: './template.service.waterfall.component.html',
  styleUrls: ['./template.service.waterfall.component.less'],
  standalone: true,
  imports: [
    NzTabsModule,
    TemplateTablePropertiesComponent,
    TemplateTableActionsComponent,
    TemplateTableEventsComponent,
    NzRowDirective,
    NzColDirective,
    NzCardModule,
    NzDescriptionsModule,
    NzSpaceModule,
    NzTagModule,
    NzTableModule,
    TemplateServiceHeaderComponent,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateServiceWaterfallComponent {

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

  // onServiceRemoved(service: Service) {
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
  // }

  // onEditIID(service: Service) {
  //
  // }
  //
  // onEditCode(service: Service) {
  //   const modal = this.modal.create<EditStringComponent, EditableString, string>({
  //     nzTitle: '修改功能组代码',
  //     nzContent: EditStringComponent,
  //     nzViewContainerRef: this.viewContainerRef,
  //     nzData: new EditableString(service.type.name),
  //     nzFooter: [
  //       {
  //         label: '取消',
  //         onClick: component => component!.cancel()
  //       },
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
  //       service.type.name = result;
  //       this.changed.emit(service);
  //     }
  //   });
  // }

  // onEditDescription(service: Service) {
  //   const modal = this.modal.create<EditStringComponent, EditableString, string>({
  //     nzTitle: '修改功能组描述',
  //     nzContent: EditStringComponent,
  //     nzViewContainerRef: this.viewContainerRef,
  //     nzData: new EditableString(service.description.get(this.language)),
  //     nzFooter: [
  //       {
  //         label: '取消',
  //         onClick: component => component!.cancel()
  //       },
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
  //       service.description.set(this.language, result);
  //       this.changed.emit(service);
  //     }
  //   });
  // }

  // onPropertyChanged(property: Property) {
  //   this.changed.emit(this.service);
  // }
  //
  // onPropertyRemoved(property: Property) {
  //   this.service.properties.delete(property.iid);
  //   this.changed.emit(this.service);
  // }
}
