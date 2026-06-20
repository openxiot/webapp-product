import {Component, inject, Input} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {NzFormModule} from 'ng-zorro-antd/form';
import {ReactiveFormsModule} from '@angular/forms';
import {ActionOperation, Argument, ArgumentOperation} from '@openxiot/xiot-core-spec-ts';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {IActionData} from '../IActionData';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {ActionInValueComponent} from './in/action.in.value.component';
import {firstValueFrom, map} from 'rxjs';
import {ActionOutValueComponent} from './out/action.out.value.component';
import {NzResultModule} from 'ng-zorro-antd/result';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ArgValue} from './arg/ArgValue';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'action-invocation',
  templateUrl: './action.invocation.component.html',
  styleUrls: ['./action.invocation.component.less'],
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzDividerModule,
    NzBadgeModule,
    NzDescriptionsModule,
    ActionInValueComponent,
    ActionOutValueComponent,
    NzResultModule,
    NzGridModule,
    NzIconModule,
    NzTableModule,
    NzToolTipModule,
    TranslatePipe
  ],
  providers: [],
  standalone: true
})
export class ActionInvocationComponent {

  readonly #modal = inject(NzModalRef);
  readonly data: IActionData = inject(NZ_MODAL_DATA);
  operation: ActionOperation | null = null;
  invalid: boolean = true;
  arguments: Map<number, ArgumentOperation> = new Map();
  argValues: Map<number, ArgValue[]> = new Map();
  argValueId = 0;

  constructor(
  ) {
    console.log('did: ', this.data.did);
    console.log('service: ', this.data.service.iid);
    console.log('action: ', this.data.action.iid);

    for (let argument of this.data.action.getArgumentsIn()) {
      // minRepeat = 0为可选参数，缺省情况下，给可选参数一个值。
      for (let i = argument.minRepeat; i <= argument.minRepeat; ++i) {
        this.addValue(argument);
      }
    }
  }

  destroyModal(): void {
    this.#modal.destroy({ data: 'this the result data' });
  }

  doInvoke(): void {
  }

  // doInvoke(): Promise<ActionOperation> {
  //   console.log('doInvoke');
  //
  //   this.operation = null;
  //
  //   const action: ActionOperation = new ActionOperation();
  //   action.aid.did = this.data.did;
  //   action.aid.siid = this.data.service.iid;
  //   action.aid.iid = this.data.action.iid;
  //   action.in = this.arguments;
  //
  //   return firstValueFrom(
  //     this.device.invokeAction(action)
  //       .pipe(map(x => {
  //         this.operation = x;
  //         console.log('operation: ', this.operation);
  //         return this.operation;
  //       }))
  //   );
  // }

  getArgumentName(argument: Argument): string {
    const property = this.data.service.properties.get(argument.piid);
    if (property === undefined) {
      console.error('argument not foud: ', argument.piid);
      return 'null';
    } else {
      return property.description.get('zh-CN') || '?';
    }
  }

  onValueChanged(arg: Argument, argValue: ArgValue, value: any) {
    console.log(`onValueChanged: ${arg.piid} [${argValue.key}] => ${value}`);
    argValue.value = value;

    this.invalid = this.tryInvokeFailed();
    console.log(`action.invalid: ${this.invalid}`);

    // 删除operation，隐藏方法调用结果
    this.operation = null;
  }

  private tryInvokeFailed(): boolean {
    this.arguments = new Map<number, ArgumentOperation>();

    // 重新将所有argValues转成arguments
    this.argValues.forEach((values, iid) => {
      const list = values.map(x => x.value);
      this.arguments.set(iid, new ArgumentOperation(iid, list));
    });

    const action: ActionOperation = new ActionOperation();
    action.aid.did = this.data.did;
    action.aid.siid = this.data.service.iid;
    action.aid.iid = this.data.action.iid;
    action.in = this.arguments;

    try {
      console.log('action: ', action);
      this.data.action.tryInvoke(action, this.data.service.properties);
      console.log(`tryInvoke: ${action.status} ${action.description}`);
      return action.isError();
    } catch (e) {
      console.log('tryInvokeFailed');
      return true;
    }
  }

  addValue(arg: Argument) {
    this.argValueId++;
    let values = this.argValues.get(arg.piid);
    if (values === undefined) {
      values = [];
      this.argValues.set(arg.piid, values);
    }

    const removable = (values.length >= arg.minRepeat);
    values.push(new ArgValue(this.argValueId, removable));

    // 删除operation，隐藏方法调用结果
    this.operation = null;
  }

  removeValue(iid: number, value: ArgValue) {
    let values = this.argValues.get(iid);
    if (values !== undefined) {
      values = values.filter(x => x.key !== value.key);
      this.argValues.set(iid, values);
    }

    // 删除operation，隐藏方法调用结果
    this.operation = null;
  }

  getOutValue(iid: number): any[] {
    if (this.operation) {
      const a = this.operation.out.get(iid);
      if (a) {
        return a.values;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
}
