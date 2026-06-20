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
import {firstValueFrom, map} from 'rxjs';
import {PropertyReadValueComponent} from './value/property.read.value.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'property-reader',
  templateUrl: './property.reader.component.html',
  styleUrls: ['./property.reader.component.less'],
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
    PropertyReadValueComponent,
    TranslatePipe
  ],
  providers: [],
  standalone: true
})
export class PropertyReaderComponent {

  readonly #modal = inject(NzModalRef);
  readonly data: IPropertyData = inject(NZ_MODAL_DATA);
  operation: PropertyOperation | null = null;

  constructor(
  ) {
    console.log('did: ', this.data.did);
    console.log('service: ', this.data.service.iid);
    console.log('property: ', this.data.property.iid);
  }

  destroyModal(): void {
    this.#modal.destroy({data: 'this the result data'});
  }

  doRead(): void {
  }

  // async doRead(): Promise<PropertyOperation> {
  //   console.log('doRead');
  //
  //   this.operation = null;
  //
  //   const property: PropertyOperation = new PropertyOperation();
  //   property.pid.did = this.data.did;
  //   property.pid.siid = this.data.service.iid;
  //   property.pid.iid = this.data.property.iid;
  //
  //   return firstValueFrom(
  //     this.device.getProperty(property)
  //       .pipe(map(x => {
  //         this.operation = x;
  //         console.log('doRead: ', this.operation)
  //         return this.operation;
  //       }))
  //   );
  // }
}
