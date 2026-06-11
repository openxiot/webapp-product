import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {Property} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'action-in-list-value',
  templateUrl: './action.in.list.value.component.html',
  styleUrls: ['./action.in.list.value.component.less'],
  imports: [
    NzSelectModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  standalone: true,
  providers: []
})
export class ActionInListValueComponent {

  value: any = '';

  @Input() property: Property | undefined;

  @Output() valueChange = new EventEmitter<any>();

  onValueChanged($event: any) {
    // this.value是字符串，ValueList一般是整型，可能需要转一下。
    if (this.property?.formatString()) {
      this.valueChange.emit(this.value);
    } else {
      this.valueChange.emit(Number.parseInt(this.value));
    }
  }
}
