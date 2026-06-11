import {Component, inject, OnInit} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {EditableProperty} from './EditableProperty';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';

@Component({
  selector: 'edit-property',
  templateUrl: './edit.property.component.html',
  styleUrls: ['./edit.property.component.less'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzCheckboxModule,
    NzRadioModule,
    NzSpaceModule,
    NzButtonModule,
    NzIconModule,
  ],
  providers: [],
  standalone: true
})
export class EditPropertyComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly data: EditableProperty = inject(NZ_MODAL_DATA);
  disabled: boolean = true;

  form: FormGroup<{
    iid: FormControl<number>,
    code: FormControl<string>,
    descriptionZHCN: FormControl<string>,
    descriptionZHTW: FormControl<string>,
    descriptionENUS: FormControl<string>,
    format: FormControl<string>,
    access: FormGroup<{
      isReadable: FormControl<boolean>,
      isWritable: FormControl<boolean>,
      isNotifiable: FormControl<boolean>,
    }>,
    constraint: FormControl<string>,
    range: FormGroup<{
      min: FormControl<number>,
      max: FormControl<number>,
      step: FormControl<number>,
    }>,
    list: FormArray<FormGroup<{
      value: FormControl<number>,
      description: FormControl<string>,
    }>>,
    hasDefaultValue: FormControl<boolean>,
  }>;

  formats: { value: string, label: string } [] = [
    { value: 'bool', label: '布尔值'},
    { value: 'uint8', label: '无符号8位整型'},
    { value: 'uint16', label: '无符号16位整型'},
    { value: 'uint32', label: '无符号32位整型'},
    { value: 'int8', label: '8位整型'},
    { value: 'int16', label: '16位整型'},
    { value: 'int32', label: '32位整型'},
    { value: 'int64', label: '64位整型'},
    { value: 'float', label: '浮点数'},
    { value: 'string', label: '字符串'},
    { value: 'hex', label: '16进制字符串'},
    { value: 'tlv8', label: 'TLV8字符串'},
    { value: 'combination', label: '组合值'},
  ]

  constrainable: boolean = false;
  constraintType: string = 'none';

  constructor(
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      descriptionZHCN: this.fb.control('', [Validators.required]),
      descriptionZHTW: this.fb.control('', [Validators.required]),
      descriptionENUS: this.fb.control('', [Validators.required]),
      format: this.fb.control('string', [Validators.required]),
      access: this.fb.group({isReadable: [false], isWritable: [false], isNotifiable: [false]}),
      constraint: this.fb.control('none', [Validators.required]),
      range: this.fb.group({min: [0], max: [100], step: [1]}),
      list: this.fb.array<
        FormGroup<{
          value: FormControl<number>,
          description: FormControl<string>,
        }>
      >([]),
      hasDefaultValue: this.fb.control(false),
    });
  }

  ngOnInit(): void {
    this.form.controls.iid.setValue(this.data.property.iid);
    this.form.controls.code.setValue(this.data.property.type.name);
    this.form.controls.descriptionZHCN.setValue(this.data.property.description.get('zh-CN') || '');
    this.form.controls.descriptionZHTW.setValue(this.data.property.description.get('zh-TW') || '');
    this.form.controls.descriptionENUS.setValue(this.data.property.description.get('en-US') || '');
    this.form.controls.descriptionENUS.setValue(this.data.property.description.get('en-US') || '');
    this.form.controls.format.setValue(this.data.property.format);
    this.form.controls.access.controls.isReadable.setValue(this.data.property.access.isReadable);
    this.form.controls.access.controls.isWritable.setValue(this.data.property.access.isWritable);
    this.form.controls.access.controls.isNotifiable.setValue(this.data.property.access.isNotifiable);

    this.constrainable = this.getConstrainable(this.data.property.format);
    this.constraintType = this.getConstrainType();
    this.form.controls.constraint.setValue(this.constraintType);

    switch (this.constraintType) {
      case 'none':
         break;

      case 'range':
        const min = this.data.property.valueRange()?.minValue?.rawValue() || 0;
        const max = this.data.property.valueRange()?.maxValue?.rawValue() || 0;
        const step = this.data.property.valueRange()?.stepValue?.rawValue() || 0;
        this.form.controls.range.setValue({min: min, max: max, step: step});
        break;

      case 'list':
        break;
    }
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.data.property);
  }

  get list(): FormArray<FormGroup<{
    value: FormControl<number>,
    description: FormControl<string>,
  }>> {
    return this.form.controls.list;
  }

  onChanged() {
    this.disabled = false;
  }

  onFormatChanged() {
    this.constrainable = this.getConstrainable(this.form.controls.format.value);
    this.onChanged();
  }

  private getConstrainable(format: string): boolean {
    switch (format) {
      case 'uint8':
      case 'uint16':
      case 'uint32':
      case 'int8':
      case 'int16':
      case 'int32':
      case 'int64':
      case 'float':
        return true;

      default:
        return false;
    }
  }

  private getConstrainType(): string {
    if (this.data.property.hasConstraintValue()) {
      if (this.data.property.hasValueRange()) {
        return 'range';
      }

      if (this.data.property.hasValueList()) {
        return 'list';
      }
    }

    return 'none';
  }

  onConstraintChanged(value: string) {
    console.log('onConstraintChanged: ', value);
    this.constraintType = value;
    this.onChanged();
  }

  addValueItem() {
    this.list.push(this.createValueItem());
  }

  createValueItem(): FormGroup<{
    value: FormControl<number>,
    description: FormControl<string>,
  }> {
    return this.fb.group({
      value: 0,
      description: '',
    });
  }

  removeValueItem(i: number) {

  }
}
