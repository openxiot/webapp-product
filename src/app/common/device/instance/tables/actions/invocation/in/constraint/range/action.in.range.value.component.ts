import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Property} from '@openxiot/xiot-core-spec-ts';
import {NzSliderModule} from 'ng-zorro-antd/slider';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

@Component({
  selector: 'action-in-range-value',
  templateUrl: './action.in.range.value.component.html',
  styleUrls: ['./action.in.range.value.component.less'],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NzSliderModule,
    NzInputNumberModule,
    NzRowDirective,
    NzColDirective,
  ],
  standalone: true,
  providers: []
})
export class ActionInRangeValueComponent {

  value: number = 0;

  @Input() property: Property | undefined;

  @Output() valueChange = new EventEmitter<any>();

  onValueChanged($event: any) {
    this.valueChange.emit(this.value);
  }
}
