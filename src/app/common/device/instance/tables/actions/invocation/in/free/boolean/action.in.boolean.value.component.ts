import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Property} from '@openxiot/xiot-core-spec-ts';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzSelectComponent} from 'ng-zorro-antd/select';

@Component({
  selector: 'action-in-boolean-value',
  templateUrl: './action.in.boolean.value.component.html',
  styleUrls: ['./action.in.boolean.value.component.less'],
  imports: [
    NzSwitchModule,
    ReactiveFormsModule,
    FormsModule,
    NzSelectComponent
  ],
  standalone: true,
  providers: []
})
export class ActionInBooleanValueComponent {

  value: boolean = false;

  @Input() property: Property | undefined;

  @Output() valueChange = new EventEmitter<any>();

  onValueChanged($event: any) {
    this.valueChange.emit(this.value);
  }
}
