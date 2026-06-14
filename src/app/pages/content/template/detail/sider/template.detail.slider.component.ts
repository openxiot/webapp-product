import {Component, Input, OnChanges, SimpleChanges, ViewContainerRef} from '@angular/core';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzListModule} from 'ng-zorro-antd/list';
import {TemplateServiceWaterfallComponent} from './service/waterfall/template.service.waterfall.component';
import {DeviceTemplate, ObjectWithLifecycle, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {DetailServiceGroupComponent} from './group/detail.service.group.component';
import {TemplateServiceSplitComponent} from './service/split/template.service.split.component';

@Component({
  selector: 'template-detail-slider',
  templateUrl: './template.detail.slider.component.html',
  styleUrls: ['./template.detail.slider.component.less'],
  standalone: true,
  imports: [
    NzMenuModule,
    NzLayoutModule,
    NzListModule,
    TemplateServiceWaterfallComponent,
    DetailServiceGroupComponent,
    TemplateServiceSplitComponent,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateDetailSliderComponent implements OnChanges {

  @Input() version: boolean = false;
  @Input() expert: boolean = false;
  @Input() template: DeviceTemplate | undefined = undefined;
  @Input() language: string = 'zh-CN';
  // @Output() changed = new EventEmitter<ObjectWithLifecycle<DeviceTemplate>>();
  // @Output() removed = new EventEmitter<Service>();

  service: ServiceTemplate | undefined = undefined;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private msg: NzMessageService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['device']) {
      if (this.service) {
        if (this.template) {
          this.service = this.template.services.get(this.service.iid);
        }
      } else {
        this.service = undefined;
      }
    }
  }

  onServiceSelected(s: ServiceTemplate) {
    this.service = s;
  }

  // onChanged(service: ServiceTemplate) {
  //   this.changed.emit(this.template);
  // }
  //
  // onRemoved($event: Service) {
  //   this.service = undefined;
  //   this.removed.emit($event);
  // }
}
