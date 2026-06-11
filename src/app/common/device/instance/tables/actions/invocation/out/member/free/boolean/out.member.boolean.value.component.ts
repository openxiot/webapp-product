import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Property} from '@openxiot/xiot-core-spec-ts';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzSpaceModule} from 'ng-zorro-antd/space';

@Component({
  selector: 'out-member-boolean-value',
  templateUrl: './out.member.boolean.value.component.html',
  styleUrls: ['./out.member.boolean.value.component.less'],
  imports: [
    NzSwitchModule,
    ReactiveFormsModule,
    FormsModule,
    NzSpaceModule
  ],
  standalone: true,
  providers: []
})
export class OutMemberBooleanValueComponent {

  @Input() property: Property | undefined;

  @Input() value: any;
}
