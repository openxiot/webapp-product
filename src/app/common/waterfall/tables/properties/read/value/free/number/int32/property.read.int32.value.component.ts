import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {Property} from '@openxiot/xiot-core-spec-ts';
import {NzSpaceModule} from 'ng-zorro-antd/space';

@Component({
  selector: 'property-read-int32-value',
  templateUrl: './property.read.int32.value.component.html',
  styleUrls: ['./property.read.int32.value.component.less'],
  imports: [
    ReactiveFormsModule,
    NzInputNumberModule,
    FormsModule,
    NzSpaceModule,
  ],
  standalone: true,
  providers: []
})
export class PropertyReadInt32ValueComponent {

  @Input() property: Property | undefined;

  @Input() value!: any;
}
