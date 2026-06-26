import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {Property} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'property-write-float-value',
  templateUrl: './property.write.float.value.component.html',
  styleUrls: ['./property.write.float.value.component.less'],
  imports: [
    ReactiveFormsModule,
    NzInputNumberModule,
    FormsModule,
  ],
  standalone: true,
  providers: []
})
export class PropertyWriteFloatValueComponent {

  value: number = 0.0;

  @Input() property: Property | undefined;

  @Output() valueChange = new EventEmitter<any>();

  onValueChanged($event: any) {
    this.valueChange.emit(this.value);
  }
}
