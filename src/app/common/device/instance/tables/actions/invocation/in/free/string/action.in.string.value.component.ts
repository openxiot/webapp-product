import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Property} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'action-in-string-value',
  templateUrl: './action.in.string.value.component.html',
  styleUrls: ['./action.in.string.value.component.less'],
  imports: [
    NzInputDirective,
    ReactiveFormsModule,
    FormsModule
  ],
  standalone: true,
  providers: []
})
export class ActionInStringValueComponent {

  value: any = '';

  @Input() property: Property | undefined;

  @Output() valueChange = new EventEmitter<any>();

  onValueChanged($event: any) {
    this.valueChange.emit(this.value);
  }
}
