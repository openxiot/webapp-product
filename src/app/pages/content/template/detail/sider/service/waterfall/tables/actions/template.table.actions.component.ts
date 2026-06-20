import {Component, Input, ViewContainerRef} from '@angular/core';
import {Action, ActionTemplate, Argument, DataFormat, Property, Service, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzTableComponent, NzTableModule} from "ng-zorro-antd/table";
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'template-table-actions',
  templateUrl: './template.table.actions.component.html',
  styleUrls: ['./template.table.actions.component.less'],
  standalone: true,
  imports: [
    NzTableModule,
    NzTableComponent,
    NzTagModule,
    NzToolTipModule,
    NzIconModule,
    NzSpaceModule,
    NzButtonComponent,
    NzRowDirective,
    NzColDirective,
    NzDropDownModule,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ]
})
export class TemplateTableActionsComponent {

  @Input() version: boolean = false;
  @Input() service!: ServiceTemplate;
  @Input() language: string = 'zh-CN';

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private msg: NzMessageService
  ) {
    console.log("ActionsControllerComponent.constructor");
  }

  protected getProperty(iid: number): Property | undefined {
    return this.service.properties.get(iid);
  }

  protected readonly DataFormat = DataFormat;

  onClickArgumentIn(arg: Argument) {
    console.log(`onClickArgumentIn: ` + arg.piid);
  }

  onClickArgumentOut(arg: Argument) {
    console.log(`onClickArgumentOut: ` + arg.piid);
  }

  onRemove(p: ActionTemplate) {
    this.msg.info('删除方法...');
  }
}
