import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {Property} from '@openxiot/xiot-core-spec-ts';
import {NzSpaceModule} from 'ng-zorro-antd/space';

@Component({
  selector: 'property-read-float-value',
  templateUrl: './property.read.float.value.component.html',
  styleUrls: ['./property.read.float.value.component.less'],
  imports: [
    ReactiveFormsModule,
    NzInputNumberModule,
    FormsModule,
    NzSpaceModule,
  ],
  standalone: true,
  providers: []
})
export class PropertyReadFloatValueComponent {

  @Input() property: Property | undefined;

  @Input() value!: any;
}
