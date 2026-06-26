import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewContainerRef} from '@angular/core';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzListModule} from 'ng-zorro-antd/list';
import {DeviceTemplate, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {TemplateDetailServicesComponent} from './services/template.detail.services.component';
import {TemplateServiceSplitComponent} from './service/split/template.service.split.component';
import {NzCardModule} from 'ng-zorro-antd/card';

@Component({
  selector: 'template-detail-slider',
  templateUrl: './template.detail.slider.component.html',
  styleUrls: ['./template.detail.slider.component.less'],
  standalone: true,
  imports: [
    NzMenuModule,
    NzLayoutModule,
    NzListModule,
    NzCardModule,
    TemplateDetailServicesComponent,
    TemplateServiceSplitComponent,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateDetailSliderComponent implements OnChanges {

  @Input() version: boolean = false;
  @Input() editable: boolean = false;
  @Input() template: DeviceTemplate | undefined = undefined;
  @Output() changed = new EventEmitter<void>();
  @Output() removed = new EventEmitter<ServiceTemplate>();

  service: ServiceTemplate | undefined = undefined;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private msg: NzMessageService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['template']) {
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

  protected onChanged() {
    this.changed.emit();
  }

  protected onRemoved(s: ServiceTemplate) {
    this.service = undefined;
    this.removed.emit(s);
  }
}
