import {Component, Input} from '@angular/core';
import {Property, ServiceTemplate, EventTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzTableComponent, NzTableModule} from "ng-zorro-antd/table";
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzTooltipDirective} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzMessageService} from 'ng-zorro-antd/message';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'template-table-events',
  templateUrl: './template.table.events.component.html',
  styleUrls: ['./template.table.events.component.less'],
  standalone: true,
  imports: [
    NzTableModule,
    NzTableComponent,
    NzTagModule,
    NzTooltipDirective,
    NzIconModule,
    NzSpaceModule,
    NzButtonComponent,
    NzRowDirective,
    NzColDirective,
    TranslatePipe,
  ],
})
export class TemplateTableEventsComponent {

  @Input() version: boolean = false;
  @Input() service!: ServiceTemplate;
  @Input() language: string = 'zh-CN';

  constructor(
    private msg: NzMessageService
  ) {
    console.log("EventsControllerComponent.constructor");
  }

  protected getProperty(iid: number): Property | undefined {
    return this.service.properties.get(iid);
  }

  onRemove(p: EventTemplate) {
    this.msg.info('删除事件...');
  }
}
