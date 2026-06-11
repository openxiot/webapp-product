import {Component, Input, ViewContainerRef} from '@angular/core';
import {Property, Service, Event} from '@openxiot/xiot-core-spec-ts';
import {NzTableComponent, NzTableModule} from "ng-zorro-antd/table";
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzTooltipDirective} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'editor-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.less'],
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
  ],
})
export class EventsControllerComponent {

  @Input() version: boolean = false;
  @Input() service!: Service;
  @Input() language: string = 'zh-CN';

  constructor(
    private msg: NzMessageService
  ) {
    console.log("EventsControllerComponent.constructor");
  }

  protected getProperty(iid: number): Property | undefined {
    return this.service.properties.get(iid);
  }

  onRemove(p: Event) {
    this.msg.info('删除事件...');
  }
}
