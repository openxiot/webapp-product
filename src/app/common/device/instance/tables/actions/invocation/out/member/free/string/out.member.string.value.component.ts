import {Component, Input} from '@angular/core';
import {Property} from '@openxiot/xiot-core-spec-ts';
import { NzSpaceModule} from 'ng-zorro-antd/space';

@Component({
  selector: 'out-member-string-value',
  templateUrl: './out.member.string.value.component.html',
  styleUrls: ['./out.member.string.value.component.less'],
  imports: [
    NzSpaceModule
  ],
  standalone: true,
  providers: []
})
export class OutMemberStringValueComponent {

  @Input() property: Property | undefined;

  @Input() value: any;
}
