import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {
  FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators
} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzCardModule} from 'ng-zorro-antd/card';
import {GenericVersion, ProductController, ProductControllerWeb} from '@openxiot/xiot-core-spec-ts';
import {ProductControllerUploadComponent} from '../upload/product.controller.upload.component';
import {ControllerWeb} from '../upload/ControllerWeb';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-controller-edit',
  styleUrl: './product.controller.edit.component.less',
  templateUrl: './product.controller.edit.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzRadioModule,
    NzCardModule,
    ProductControllerUploadComponent,
    TranslatePipe,
  ],
})
export class ProductControllerEditComponent {

  readonly #modal = inject(NzModalRef);
  readonly data: ProductController = inject(NZ_MODAL_DATA);

  form: FormGroup<{
    category: FormControl<string>,
    type: FormControl<string>,
    versionName: FormControl<string>,
    versionCode: FormControl<number>,
    web: FormControl<ControllerWeb>,
  }>;

  constructor(
    private fb: NonNullableFormBuilder,
  ) {
    const existing = this.data.web;
    this.form = this.fb.group({
      category: this.fb.control(this.data.category, [Validators.required]),
      type: this.fb.control({value: this.data.type || 'web', disabled: true}, [Validators.required]),
      versionName: this.fb.control(this.data.version.name, [Validators.required]),
      versionCode: this.fb.control({value: this.data.version.code, disabled: true}, [Validators.min(1)]),
      web: this.fb.control(
        new ControllerWeb(existing?.url || '', existing?.format || 'html', this.data.version.name || '已上传', 0),
        [Validators.required],
      ),
    });
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    if (this.form.invalid) {
      for (const key of Object.keys(this.form.controls)) {
        this.form.controls[key as keyof typeof this.form.controls].markAsDirty();
        this.form.controls[key as keyof typeof this.form.controls].updateValueAndValidity();
      }
      return;
    }

    const web = this.form.controls.web.value;
    const controllerWeb: ProductControllerWeb | null = web?.url
      ? new ProductControllerWeb(web.format, web.url)
      : null;

    const updated = new ProductController(
      this.data.lifecycle,
      this.form.controls.category.value,
      this.form.controls.type.value,
      controllerWeb,
      new GenericVersion(this.form.controls.versionName.value, this.data.version.code),
      this.data.instance,
    );

    this.#modal.destroy(updated);
  }
}