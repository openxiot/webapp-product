import {Component, inject, OnInit} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {EditableService} from './EditableService';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';

@Component({
  selector: 'edit-service',
  templateUrl: './edit.service.component.html',
  styleUrls: ['./edit.service.component.less'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
  ],
  providers: [],
  standalone: true
})
export class EditServiceComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly data: EditableService = inject(NZ_MODAL_DATA);
  disabled: boolean = true;

  form: FormGroup<{
    iid: FormControl<number>,
    code: FormControl<string>,
    descriptionZHCN: FormControl<string>,
    descriptionZHTW: FormControl<string>,
    descriptionENUS: FormControl<string>,
  }>;

  constructor(
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      descriptionZHCN: this.fb.control('', [Validators.required]),
      descriptionZHTW: this.fb.control('', [Validators.required]),
      descriptionENUS: this.fb.control('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.form.controls.iid.setValue(this.data.service.iid);
    this.form.controls.code.setValue(this.data.service.type.name);
    this.form.controls.descriptionZHCN.setValue(this.data.service.description.get('zh-CN') || '');
    this.form.controls.descriptionZHTW.setValue(this.data.service.description.get('zh-TW') || '');
    this.form.controls.descriptionENUS.setValue(this.data.service.description.get('en-US') || '');
  }

  onChanged() {
    this.disabled = false;
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.data.service);
  }
}
