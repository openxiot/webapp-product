import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {DeviceTemplate, ServiceDefinition, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../../service/i18n.service';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {
  ServicesDefinitionSelectorComponent
} from '../../../../../../common/dialog/definition/select/services/services.definition.selector.component';
import {ServicesOption} from '../../../../../../common/dialog/definition/select/services/ServicesOption';

@Component({
  selector: 'template-detail-services',
  templateUrl: './template.detail.services.component.html',
  styleUrls: ['./template.detail.services.component.less'],
  standalone: true,
  imports: [
    TranslatePipe,
    NzTagComponent,
    NzMenuModule,
    NzCardModule,
    NzSpaceModule,
    NzIconModule,
    NzDropDownModule,
    NzButtonModule,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateDetailServicesComponent {

  @Input() version: boolean = true;
  @Input() editable: boolean = false;
  @Input() device: DeviceTemplate | undefined = undefined;
  @Output() selected = new EventEmitter<ServiceTemplate>();

  constructor(
    public i18n: MainI18nService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private msg: NzMessageService
  ) {
  }

  onClickService(s: ServiceTemplate) {
    this.selected.emit(s);
  }

  onAddService() {
    const modal = this.modal.create<ServicesDefinitionSelectorComponent, ServicesOption, ServiceDefinition[]>({
      nzTitle: this.i18n.translate.instant('添加服务'),
      nzWidth: 800,
      nzContent: ServicesDefinitionSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new ServicesOption(),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: false,
          type: 'primary',
          disabled: component => component!.disabled || false,
          onClick: component => component!.ok()
        }
      ],
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        if (result.length > 0) {
          this.addServiceDefinitions(result);
        }
      }
    });
  }

  protected addServiceDefinitions(defs: ServiceDefinition[]) {
    // this.loading = true;
    // this.service.createFormatDefinitions(defs)
    //   .subscribe({
    //     next: () => {
    //       console.log('createFormatDefinitions ok');
    //       this.loading = false;
    //       this.loadDataFromServer();
    //     },
    //     error: error => {
    //       this.msg.warning(error);
    //       this.loading = false;
    //     }
    //   });
  }
}
