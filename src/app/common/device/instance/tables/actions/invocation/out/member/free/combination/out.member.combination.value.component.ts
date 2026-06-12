import {Component, forwardRef, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Argument, Property, Service} from '@openxiot/xiot-core-spec-ts';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {OutMemberValueComponent} from '../../out.member.value.component';
import {NzSpaceModule} from 'ng-zorro-antd/space';

@Component({
  selector: 'out-member-combination-value',
  templateUrl: './out.member.combination.value.component.html',
  styleUrls: ['./out.member.combination.value.component.less'],
  imports: [
    NzSwitchModule,
    ReactiveFormsModule,
    FormsModule,
    NzDescriptionsModule,
    forwardRef(() => OutMemberValueComponent),
    NzSpaceModule,
  ],
  standalone: true,
  providers: []
})
export class OutMemberCombinationValueComponent {

  @Input() property: Property | undefined;

  @Input() argument: Argument | undefined;

  @Input() service: Service | undefined;

  @Input() value: any;

  getMemberName(iid: number): string {
    return this.service?.properties.get(iid)?.description.get('zh-CN') || '';
  }

  getMemberArgument(iid: number): Argument {
    return Argument.of(iid, 1, 1);
  }

  getMemberValue(iid: number, value: any): any {
    return value.get(iid);
  }
}
