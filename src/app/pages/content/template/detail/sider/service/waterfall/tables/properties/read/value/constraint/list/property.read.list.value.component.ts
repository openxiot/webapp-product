import {Component, Input} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Property} from '@openxiot/xiot-core-spec-ts';
import {NzSpaceModule} from 'ng-zorro-antd/space';

@Component({
  selector: 'property-read-list-value',
  templateUrl: './property.read.list.value.component.html',
  styleUrls: ['./property.read.list.value.component.less'],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NzSpaceModule
  ],
  standalone: true,
  providers: []
})
export class PropertyReadListValueComponent {

  @Input() property: Property | undefined;

  @Input() value!: any;

  getValueDescription(x: any): string | undefined {
    if (this.property) {
      const list = this.property.valueList();
      if (list) {
        const found = list.values.find(v => v.value === x);
        if (found) {
          return found.description.get('zh-CN');
        }
      }
    }

    return undefined;
  }
}
