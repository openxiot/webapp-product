import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {Property} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'property-write-int16-value',
  templateUrl: './property.write.int16.value.component.html',
  styleUrls: ['./property.write.int16.value.component.less'],
  imports: [
    ReactiveFormsModule,
    NzInputNumberModule,
    FormsModule,
  ],
  standalone: true,
  providers: []
})
export class PropertyWriteInt16ValueComponent {

  value: any = 0;

  @Input() property: Property | undefined;

  @Output() valueChange = new EventEmitter<any>();

  onValueChanged($event: any) {
    this.valueChange.emit(this.value);
  }
}

