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
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'create-firmware',
  styleUrls: ['./create.firmware.component.less'],
  templateUrl: './create.firmware.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputDirective,
    ProductFirmwareTypeComponent,
    TranslatePipe,
  ],
  providers: [],
})
export class CreateFirmwareComponent {

  readonly #modal = inject(NzModalRef);
  readonly data: string = inject(NZ_MODAL_DATA);

  form: FormGroup<{
    name: FormControl<string>,
    description: FormControl<string>,
    type: FormControl<string>,
  }>;

  constructor(
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      name: this.fb.control('', [Validators.required, Validators.pattern(/^[a-zA-Z\-]+$/)]),
      description: this.fb.control('', [Validators.required]),
      type: this.fb.control('simple', [Validators.required]),
    });
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    const name = this.form.controls.name.value;
    const description = this.form.controls.description.value;
    const type = this.form.controls.type.value;
    this.#modal.destroy(new ProductFirmware(name, description, type));
  }
}
