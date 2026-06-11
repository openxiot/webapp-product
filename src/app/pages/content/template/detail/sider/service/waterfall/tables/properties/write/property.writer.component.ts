import {Component, inject} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {NzFormModule} from 'ng-zorro-antd/form';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PropertyOperation} from '@openxiot/xiot-core-spec-ts';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzResultModule} from 'ng-zorro-antd/result';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTableModule} from 'ng-zorro-antd/table';
import {IPropertyData} from '../IPropertyData';
import {PropertyWriteValueComponent} from './value/property.write.value.component';

@Component({
  selector: 'property-writer',
  templateUrl: './property.writer.component.html',
  styleUrls: ['./property.writer.component.less'],
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzDividerModule,
    NzBadgeModule,
    NzDescriptionsModule,
    NzResultModule,
    NzGridModule,
    NzIconModule,
    NzTableModule,
    FormsModule,
    PropertyWriteValueComponent
  ],
  providers: [],
  standalone: true
})
export class PropertyWriterComponent {

  readonly #modal = inject(NzModalRef);
  readonly data: IPropertyData = inject(NZ_MODAL_DATA);
  operation: PropertyOperation | null = null;
  value: any;

  constructor(
  ) {
    console.log('did: ', this.data.did);
    console.log('service: ', this.data.service.iid);
    console.log('property: ', this.data.property.iid);
  }

  destroyModal(): void {
    this.#modal.destroy({data: 'this the result data'});
  }

  onValueChanged(value: any) {
    console.log(`onValueChanged: `, value);

    this.value = value;

    // 删除operation，隐藏调用结果
    this.operation = null;
  }

  doWrite(): void {
  }

  // async doWrite(): Promise<PropertyOperation> {
  //   console.log('doWrite');
  //
  //   this.operation = null;
  //
  //   const property: PropertyOperation = new PropertyOperation();
  //   property.pid.did = this.data.did;
  //   property.pid.siid = this.data.service.iid;
  //   property.pid.iid = this.data.property.iid;
  //   property.value = this.value;
  //
  //   return firstValueFrom(
  //     this.device.setProperty(property)
  //       .pipe(map(x => this.operation = x))
  //   );
  // }
}
