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
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzInputNumberComponent} from 'ng-zorro-antd/input-number';

@Component({
  selector: 'create-action',
  styleUrls: ['./create.action.component.less'],
  templateUrl: './create.action.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzColDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzInputDirective,
    NzInputNumberComponent,
    NzRowDirective,
  ],
  providers: [],
})
export class CreateActionComponent {

  readonly #modal = inject(NzModalRef);
  readonly data: string = inject(NZ_MODAL_DATA);

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
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
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      descriptionZHCN: this.fb.control('', [Validators.required]),
      descriptionZHTW: this.fb.control('', [Validators.required]),
      descriptionENUS: this.fb.control('', [Validators.required]),
    });
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(undefined);
  }
}
