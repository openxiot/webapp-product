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
import {ProductFirmwareNameComponent} from '../name/product.firmware.name.component';
import {ProductFirmwareUrlComponent} from './url/product.firmware.url.component';
import {UploadFirmware} from './UploadFirmware';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {FirmwareSample, GenericVersion, LifeCycle, ProductFirmwareInstance} from '@openxiot/xiot-core-spec-ts';
import {FirmwareUrl} from './url/FirmwareUrl';

@Component({
  selector: 'upload-firmware',
  styleUrls: ['./upload.firmware.component.less'],
  templateUrl: './upload.firmware.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzInputDirective,
    ProductFirmwareNameComponent,
    ProductFirmwareUrlComponent,
  ],
  providers: [],
})
export class UploadFirmwareComponent {

  readonly #modal = inject(NzModalRef);
  readonly data: UploadFirmware = inject(NZ_MODAL_DATA);

  form: FormGroup<{
    name: FormControl<string>,
    versionName: FormControl<string>,
    url: FormControl<FirmwareUrl>,
    md5: FormControl<string>,
    memo: FormControl<string>,
    minUpgradeVersionCode: FormControl<number>
  }>;

  constructor(
    private fb: NonNullableFormBuilder,
  ) {
    this.form = this.fb.group({
      name: this.fb.control(`${this.data.firmware.name} (${this.data.firmware.description})`, [Validators.required, Validators.pattern(/^[a-zA-Z\-]+$/)]),
      versionName: this.fb.control('', [Validators.required]),
      url: this.fb.control(new FirmwareUrl(), [Validators.required]),
      md5: this.fb.control('', [Validators.required]),
      memo: this.fb.control('', [Validators.required]),
      minUpgradeVersionCode: this.fb.control(0),
    });
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    let lifecycle = LifeCycle.DEVELOPMENT;
    let version = new GenericVersion(this.form.controls.versionName.value, 0);
    let minUpgradeVersionCode = this.form.controls.minUpgradeVersionCode.value;
    let type = 'simple';
    let simple = new FirmwareSample(
      this.form.controls.memo.value,
      this.form.controls.url.value.url || '',
      this.form.controls.url.value.fileSize,
      this.form.controls.md5.value,
    );
    let instance = new ProductFirmwareInstance(lifecycle, version, minUpgradeVersionCode, type, simple);
    this.#modal.destroy(instance);
  }
}
