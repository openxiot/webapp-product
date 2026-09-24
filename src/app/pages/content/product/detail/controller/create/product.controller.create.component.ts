import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {
  FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators
} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzCardModule} from 'ng-zorro-antd/card';
import {ProductControllerWeb, ProductInstance, Urn} from '@openxiot/xiot-core-spec-ts';
import {ProductControllerUploadComponent} from '../upload/product.controller.upload.component';
import {ControllerWeb} from '../upload/ControllerWeb';
import {ProductControllerCreateData, ProductControllerCreateInput} from './ProductControllerCreate';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-controller-create',
  styleUrl: './product.controller.create.component.less',
  templateUrl: './product.controller.create.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzRadioModule,
    NzCardModule,
    ProductControllerUploadComponent,
    TranslatePipe,
  ],
})
export class ProductControllerCreateComponent {

  readonly #modal = inject(NzModalRef);
  readonly data: ProductControllerCreateInput = inject(NZ_MODAL_DATA);

  // instance 选项：仅展示功能版本号（自然数），值为对应 urn；按 urn 去重
  instances: {urn: string, version: number, instance: ProductInstance}[] = Array.from(
    new Map(
      this.data.productInstances
        .filter(x => x.type !== null)
        .map(x => {
          const urn = x.type as Urn;
          return [urn.toString(), {urn: urn.toString(), version: urn.version, instance: x}] as const;
        })
    ).values()
  );

  form: FormGroup<{
    instance: FormControl<string>,
    category: FormControl<string>,
    type: FormControl<string>,
    versionName: FormControl<string>,
    versionCode: FormControl<number>,
    web: FormControl<ControllerWeb>,
  }>;

  constructor(
    private fb: NonNullableFormBuilder,
  ) {
    const defaultInst = this.instances.length > 0 ? this.instances[0].urn : '';
    this.form = this.fb.group({
      instance: this.fb.control(defaultInst, [Validators.required]),
      category: this.fb.control('mobile', [Validators.required]),
      type: this.fb.control({value: 'web', disabled: true}, [Validators.required]),
      versionName: this.fb.control('', [Validators.required]),
      versionCode: this.fb.control(1, [Validators.required, Validators.min(1)]),
      web: this.fb.control(new ControllerWeb(), [Validators.required]),
    });

    // 根据所选 instance + category 自动推算默认版本号
    this.recomputeVersionCode();
    this.form.controls.instance.valueChanges.subscribe(() => this.recomputeVersionCode());
    this.form.controls.category.valueChanges.subscribe(() => this.recomputeVersionCode());
  }

  // 版本号 = 同 (instance, category) 现有最大 code + 1
  private recomputeVersionCode() {
    const urn = this.form.controls.instance.value;
    const category = this.form.controls.category.value;
    const codes = this.data.controllers
      .filter(c => c.instance.toString() === urn && c.category === category)
      .map(c => c.version.code);

    const next = (codes.length > 0 ? Math.max(...codes) : 0) + 1;
    this.form.controls.versionCode.setValue(next);
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

    const urnStr = this.form.controls.instance.value;
    const found = this.instances.find(x => x.urn === urnStr);
    if (!found) {
      return;
    }

    const web = this.form.controls.web.value;
    const controllerWeb: ProductControllerWeb | null = web?.url
      ? new ProductControllerWeb(web.format, web.url)
      : null;

    this.#modal.destroy(new ProductControllerCreateData(
      found.instance.type as Urn,
      this.form.controls.category.value,
      this.form.controls.versionName.value,
      this.form.controls.versionCode.value,
      controllerWeb,
    ));
  }
}