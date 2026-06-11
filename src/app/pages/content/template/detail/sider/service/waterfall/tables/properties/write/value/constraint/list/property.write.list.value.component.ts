import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Property} from '@openxiot/xiot-core-spec-ts';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';

@Component({
  selector: 'property-write-list-value',
  templateUrl: './property.write.list.value.component.html',
  styleUrls: ['./property.write.list.value.component.less'],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NzOptionComponent,
    NzSelectComponent
  ],
  standalone: true,
  providers: []
})
export class PropertyWriteListValueComponent {

  value: any = '';

  @Input() property: Property | undefined;

  @Output() valueChange = new EventEmitter<any>();

  onValueChanged($event: any) {
    this.valueChange.emit(this.value);
  }
}
