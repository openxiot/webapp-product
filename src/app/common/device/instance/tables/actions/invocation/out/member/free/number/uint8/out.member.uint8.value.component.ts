import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {Property} from '@openxiot/xiot-core-spec-ts';
import {NzSpaceModule} from 'ng-zorro-antd/space';

@Component({
  selector: 'out-member-uint8-value',
  templateUrl: './out.member.uint8.value.component.html',
  styleUrls: ['./out.member.uint8.value.component.less'],
  imports: [
    ReactiveFormsModule,
    NzInputNumberModule,
    FormsModule,
    NzSpaceModule,
  ],
  standalone: true,
  providers: []
})
export class OutMemberUint8ValueComponent {

  @Input() property: Property | undefined;

  @Input() value: any;
}
