import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Argument, Property, Service} from '@openxiot/xiot-core-spec-ts';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {OutMemberValueComponent} from '../../member/out.member.value.component';

@Component({
  selector: 'action-out-combination-value',
  templateUrl: './action.out.combination.value.component.html',
  styleUrls: ['./action.out.combination.value.component.less'],
  imports: [
    NzSwitchModule,
    ReactiveFormsModule,
    FormsModule,
    NzDescriptionsModule,
    NzSpaceModule,
    OutMemberValueComponent,
  ],
  standalone: true,
  providers: []
})
export class ActionOutCombinationValueComponent {

  @Input() property: Property | undefined;

  @Input() argument: Argument | undefined;

  @Input() service: Service | undefined;

  @Input() values: any[] = [];

  getMemberName(iid: number): string {
    return this.service?.properties.get(iid)?.description.get('zh-CN') || '';
  }

  getMemberArgument(iid: number): Argument {
    return Argument.from(iid, 1, 1);
  }

  getMemberValue(iid: number, value: any): any {
    return value.get(iid);
  }
}
