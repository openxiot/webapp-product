import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {ProductFirmwareTypeComponent} from '../type/product.firmware.type.component';
import {ProductFirmware} from '@openxiot/xiot-core-spec-ts';
import {ProductFirmwareNameComponent} from '../name/product.firmware.name.component';
import {EditFirmwareResult} from './EditFirmwareResult';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'edit-firmware',
  styleUrls: ['./edit.firmware.component.less'],
  templateUrl: './edit.firmware.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputDirective,
    ProductFirmwareTypeComponent,
    ProductFirmwareNameComponent,
    TranslatePipe,
  ],
  providers: [],
})
export class EditFirmwareComponent {

  readonly #modal = inject(NzModalRef);
  readonly data: ProductFirmware = inject(NZ_MODAL_DATA);

  form: FormGroup<{
    name: FormControl<string>,
    description: FormControl<string>,
    type: FormControl<string>,
  }>;

  constructor(
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      name: this.fb.control(this.data.name, [Validators.required, Validators.pattern(/^[a-zA-Z\-]+$/)]),
      description: this.fb.control(this.data.description, [Validators.required]),
      type: this.fb.control({value: this.data.type, disabled: true}, [Validators.required]),
    });
  }

  delete(): void {
    const result = new EditFirmwareResult('delete', this.data);
    this.#modal.destroy(result);
  }

  cancel(): void {
    const result = new EditFirmwareResult('cancel', this.data);
    this.#modal.destroy(result);
  }

  ok(): void {
    this.data.description = this.form.controls.description.value;
    const result = new EditFirmwareResult('save', this.data);
    this.#modal.destroy(result);
  }
}
