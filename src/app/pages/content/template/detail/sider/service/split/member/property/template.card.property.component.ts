import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';

import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  DataFormat,
  Property,
  Service,
  ValueRange,
  ValueList,
  ValueDefinition,
  ServiceTemplate, PropertyTemplate
} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {EditorServicePropertyMemberComponent} from './member/editor.service.property.member.component';
import {Member} from './member/Member';
import {EditorNamespaceComponent} from './namespace/editor.namespace.component';
import {TranslatePipe} from '@ngx-translate/core';
import {CodeComponent} from '../../../../../../../../../common/form/item/common/code/code.component';
import {
  DescriptionComponent
} from '../../../../../../../../../common/form/item/common/description/description.component';

@Component({
  selector: 'template-card-property',
  templateUrl: './template.card.property.component.html',
  styleUrls: ['./template.card.property.component.less'],
  standalone: true,
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
    NzCardModule,
    EditorServicePropertyMemberComponent,
    EditorNamespaceComponent,
    TranslatePipe,
    CodeComponent,
    DescriptionComponent
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateCardPropertyComponent implements OnInit, OnChanges {

  @Input() editable: boolean = false;
  @Input() service!: ServiceTemplate;
  @Input() property!: PropertyTemplate;
  @Output() changed = new EventEmitter<void>();
  @Output() removed = new EventEmitter<PropertyTemplate>();

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
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
    members: FormArray<FormGroup<{
      member: FormControl<Member>,
    }>>,
  }>;

  formats: { value: string, label: string } [] = [
    {value: 'bool', label: '布尔值'},
    {value: 'uint8', label: '无符号8位整型'},
    {value: 'uint16', label: '无符号16位整型'},
    {value: 'uint32', label: '无符号32位整型'},
    {value: 'int8', label: '8位整型'},
    {value: 'int16', label: '16位整型'},
    {value: 'int32', label: '32位整型'},
    {value: 'int64', label: '64位整型'},
    {value: 'float', label: '浮点数'},
    {value: 'string', label: '字符串'},
    {value: 'hex', label: '16进制字符串'},
    {value: 'tlv8', label: 'TLV8字符串'},
    {value: 'combination', label: '组合值'},
  ]

  combinationValue: boolean = false;
  constrainable: boolean = false;
  constraintType: string = 'none';

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9-]*$/)
      ]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
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
      members: this.fb.array<
        FormGroup<{
          member: FormControl<Member>,
        }>
      >([]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property']) {
      this.reload();
    }
  }

  ngOnInit(): void {
    this.reload();
  }

  private reload() {
    this.form.controls.iid.setValue(this.property.iid);
    this.form.controls.ns.setValue(this.property.type.ns);
    this.form.controls.code.setValue(this.property.type.name);
    this.form.controls.description.setValue(this.service.description);
    this.form.controls.format.setValue(this.property.format);
    this.form.controls.access.controls.isReadable.setValue(this.property.access.isReadable);
    this.form.controls.access.controls.isWritable.setValue(this.property.access.isWritable);
    this.form.controls.access.controls.isNotifiable.setValue(this.property.access.isNotifiable);

    this.constrainable = this.getConstrainable(this.property.format);
    this.constraintType = this.getConstrainType();
    this.form.controls.constraint.setValue(this.constraintType);

    switch (this.constraintType) {
      case 'none':
        break;

      case 'range':
        const min = this.property.valueRange()?.minValue?.rawValue() || 0;
        const max = this.property.valueRange()?.maxValue?.rawValue() || 0;
        const step = this.property.valueRange()?.stepValue?.rawValue() || 0;
        this.form.controls.range.setValue({min: min, max: max, step: step});
        break;

      case 'list':
        this.list.clear();
        const list = this.property.valueList();
        if (list) {
          for (let value of list.values) {
            this.addValueItem(value);
          }
        }
        break;
    }

    console.log('init combinationValue');

    this.combinationValue = this.property.format === DataFormat.COMBINATION;
    if (this.combinationValue) {
      this.members.clear();

      for (let member of this.property.members) {
        const p = this.service.properties.get(member);
        if (p) {
          this.addMember(p);
        }
      }
    }

    console.log('init combinationValue ok');
  }

  get list(): FormArray<FormGroup<{
    value: FormControl<number>,
    description: FormControl<string>,
  }>> {
    return this.form.controls.list;
  }

  get members(): FormArray<FormGroup<{
    member: FormControl<Member>
  }>> {
    return this.form.controls.members;
  }

  onChanged() {
    this.changed.emit();
  }

  onFormatChanged() {
    this.constrainable = this.getConstrainable(this.form.controls.format.value);
    this.combinationValue = this.form.controls.format.value === DataFormat.COMBINATION;
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
    if (this.property.hasConstraintValue()) {
      if (this.property.hasValueRange()) {
        return 'range';
      }

      if (this.property.hasValueList()) {
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

  addValueItem(value: ValueDefinition) {
    const v = value.description.get('zh-CN') || value.description.get('en-US') || '?';
    this.list.push(this.createValueItem(value.value.rawValue(), v));
  }

  addDefaultValueItem() {
    this.list.push(this.createValueItem(0, ''));
    this.onChanged();
  }

  createValueItem(value: number, description: string): FormGroup<{
    value: FormControl<number>,
    description: FormControl<string>,
  }> {
    return this.fb.group({
      value: value,
      description: description,
    });
  }

  removeValueItem(item: FormGroup<{ value: FormControl<number>; description: FormControl<string> }>, i: number) {
    console.log('removeValueItem: ' + i);
    this.list.removeAt(i);
    this.onChanged();
  }

  addMemberItem() {
    // const modal = this.modal.create<SelectMemberComponent, SelectMember, Set<number>>({
    //   nzTitle: '选择属性作为成员',
    //   nzContent: SelectMemberComponent,
    //   nzViewContainerRef: this.viewContainerRef,
    //   nzData: new SelectMember(this.service, this.property, this.language),
    //   nzFooter: [
    //     {
    //       label: '取消',
    //       onClick: component => component!.cancel()
    //     },
    //     {
    //       label: '确认',
    //       danger: true,
    //       type: 'primary',
    //       onClick: component => component!.ok()
    //     }
    //   ],
    // });
    //
    // modal.afterClose.subscribe(result => {
    //   if (result) {
    //     this.members.clear();
    //
    //     const sortedResult = Array.from(result).sort((a, b) => a - b);
    //     for (let iid of sortedResult) {
    //       const p = this.service.properties.get(iid);
    //       if (p) {
    //         this.addMember(p);
    //       }
    //     }
    //
    //     this.onChanged();
    //   }
    // });
  }

  addMember(property: Property) {
    console.log('addMember: ', property.iid);
    this.members.push(this.createMemberItem(property));
  }

  createMemberItem(property: Property): FormGroup<{
    member: FormControl<Member>,
  }> {
    return this.fb.group({
      member: new Member(property, 'zh-CN')
    });
  }

  removeMemberItem(item: FormGroup<{ member: FormControl<Member> }>, i: number) {
    this.members.removeAt(i);
    this.onChanged();
  }

  onRemoved() {
    // const modal = this.modal.create<ConfirmComponent, string, string>({
    //   nzTitle: '您真的要删除这个属性吗？',
    //   nzContent: ConfirmComponent,
    //   nzViewContainerRef: this.viewContainerRef,
    //   nzData: this.property.description.get('zh-CN'),
    //   nzFooter: [
    //     {
    //       label: '取消',
    //       onClick: component => component!.cancel()
    //     },
    //     {
    //       label: '确认',
    //       danger: true,
    //       type: 'primary',
    //       onClick: component => component!.ok()
    //     }
    //   ],
    // });
    //
    // modal.afterClose.subscribe(result => {
    //   if (result) {
    //     this.removed.emit(this.property);
    //   }
    // });
  }

  // onSubmit() {
  //   console.log('onSubmit');
  //
  //   this.property.iid = this.form.controls.iid.value;
  //   this.property.type.name = this.form.controls.code.value;
  //   this.property.description.set('zh-CN', this.form.controls.descriptionZHCN.value);
  //   this.property.description.set('zh-TW', this.form.controls.descriptionZHTW.value);
  //   this.property.description.set('en-US', this.form.controls.descriptionENUS.value);
  //
  //   if (this.combinationValue) {
  //     this.property.members = [];
  //
  //     for (let item of this.form.controls.members.value) {
  //       if (item.member) {
  //         this.property.members.push(item.member.property.iid);
  //       }
  //     }
  //   }
  //
  //   switch (this.constraintType) {
  //     case 'none':
  //       break;
  //
  //     case 'range':
  //       const range = [this.form.controls.range.value.min, this.form.controls.range.value.max, this.form.controls.range.value.step];
  //       this.property.constraintValue = new ValueRange(this.property.format, range);
  //       break;
  //
  //     case 'list':
  //       const list = new ValueList();
  //
  //       for (let item of this.form.controls.list.value) {
  //         const description = new Map<string, string>();
  //         description.set('zh-CN', item.description || 'null');
  //         const value = new ValueDefinition(this.property.format, item.value || 0, description);
  //         list.values.push(value);
  //       }
  //
  //       this.property.constraintValue = list;
  //       break;
  //   }
  //
  //   // todo: save
  // }
}
