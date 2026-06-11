import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Property} from '@openxiot/xiot-core-spec-ts';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzSpaceModule} from 'ng-zorro-antd/space';

@Component({
  selector: 'property-read-boolean-value',
  templateUrl: './property.read.boolean.value.component.html',
  styleUrls: ['./property.read.boolean.value.component.less'],
  imports: [
    NzSwitchModule,
    ReactiveFormsModule,
    FormsModule,
    NzSpaceModule
  ],
  standalone: true,
  providers: []
})
export class PropertyReadBooleanValueComponent {

  @Input() property: Property | undefined;

  @Input() value!: any;
}
