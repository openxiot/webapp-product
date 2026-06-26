import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {Property} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'property-write-uint32-value',
  templateUrl: './property.write.uint32.value.component.html',
  styleUrls: ['./property.write.uint32.value.component.less'],
  imports: [
    ReactiveFormsModule,
    NzInputNumberModule,
    FormsModule,
  ],
  standalone: true,
  providers: []
})
export class PropertyWriteUint32ValueComponent {

  value: any = 0;

  @Input() property: Property | undefined;

  @Output() valueChange = new EventEmitter<any>();

  onValueChanged($event: any) {
    this.valueChange.emit(this.value);
  }
}
