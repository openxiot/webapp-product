import {Component, Input, ViewContainerRef} from '@angular/core';
import {Action, Argument, DataFormat, Property, Service} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzTableComponent, NzTableModule} from "ng-zorro-antd/table";
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';
import {IActionData} from './IActionData';
import {ActionInvocationComponent} from './invocation/action.invocation.component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'editor-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.less'],
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
export class ActionsControllerComponent {

  @Input() version: boolean = false;
  @Input() service!: Service;
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

  doInvocation(action: Action) {
    // 创建完就显示，不需要拿返回值。
    this.modal.create<ActionInvocationComponent, IActionData>({
      nzTitle: action.description.get('zh-CN'),
      nzContent: ActionInvocationComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        did: '',
        service: this.service,
        action: action
      },
      // nzOnOk: () => {
      //   return new Promise(resolve => setTimeout(resolve, 1000));
      // },
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.destroyModal()
        },
        {
          label: '调用',
          danger: true,
          type: 'primary',
          disabled: component => (action.in.size > 0 && component!.invalid),
          onClick: component => component!.doInvoke()
        }
      ],
      nzDraggable: false,
      nzWidth: 600
    });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));
    // // Return a result when closed
    // modal.afterClose.subscribe(result => console.log('[afterClose] The result is:', result));
    // const instance = modal.getContentComponent();
    // delay until modal instance created
    // setTimeout(() => {
    //   instance.subtitle = 'sub title is changed';
    // }, 2000);
  }

  protected readonly DataFormat = DataFormat;

  onClickArgumentIn(arg: Argument) {
    console.log(`onClickArgumentIn: ` + arg.piid);
  }

  onClickArgumentOut(arg: Argument) {
    console.log(`onClickArgumentOut: ` + arg.piid);
  }

  onRemove(p: Action) {
    this.msg.info('删除方法...');
  }
}
