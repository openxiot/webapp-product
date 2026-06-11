import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {Property} from '@openxiot/xiot-core-spec-ts';
import {NzSelectComponent} from 'ng-zorro-antd/select';

@Component({
  selector: 'action-in-int16-value',
  templateUrl: './action.in.int16.value.component.html',
  styleUrls: ['./action.in.int16.value.component.less'],
  imports: [
    ReactiveFormsModule,
    NzInputNumberModule,
    FormsModule,
    NzSelectComponent,
  ],
  standalone: true,
  providers: []
})
export class ActionInInt16ValueComponent {

  value: any = 0;

  @Input() property: Property | undefined;

  @Output() valueChange = new EventEmitter<any>();

  onValueChanged($event: any) {
    this.valueChange.emit(this.value);
  }
}
