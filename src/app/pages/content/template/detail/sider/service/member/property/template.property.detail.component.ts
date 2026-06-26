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
import {DataFormat, ServiceTemplate, PropertyTemplate, FormatDefinition, UnitDefinition, Access} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {Member} from './member/Member';
import {TranslatePipe} from '@ngx-translate/core';
import {SpecCodeComponent} from '../../../../../../../../common/form/item/common/code/spec.code.component';
import {
  DescriptionComponent
} from '../../../../../../../../common/form/item/common/description/description.component';
import {
  PropertyAccessComponent
} from '../../../../../../../../common/form/item/property/common/access/property.access.component';
import {
  PropertyFormatComponent
} from '../../../../../../../../common/form/item/property/common/format/property.format.component';
import {MainService} from '../../../../../../../../service/main.service';
import {AccountService} from '../../../../../../../../service/account.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {
  PropertyConstraintComponent
} from '../../../../../../../../common/form/item/property/common/constraint/property.constraint.component';
import {
  PropertyRangeComponent
} from '../../../../../../../../common/form/item/property/common/range/property.range.component';
import {
  PropertyListComponent
} from '../../../../../../../../common/form/item/property/common/list/property.list.component';
import {ConstraintType} from '../../../../../../../../common/form/item/property/common/constraint/ConstraintType';
import {RangeValue} from '../../../../../../../../common/form/item/property/common/range/RangeValue';
import {ValueItem} from '../../../../../../../../common/form/item/property/common/list/ValueItem';
import {SpecIidComponent} from '../../../../../../../../common/form/item/common/iid/spec.iid.component';
import {
  SpecRequiredComponent
} from '../../../../../../../../common/form/item/common/required/spec.required.component';

@Component({
  selector: 'template-property-detail',
  templateUrl: './template.property.detail.component.html',
  styleUrls: ['./template.property.detail.component.less'],
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
    TranslatePipe,
    SpecCodeComponent,
    DescriptionComponent,
    PropertyAccessComponent,
    PropertyFormatComponent,
    PropertyConstraintComponent,
    PropertyRangeComponent,
    PropertyListComponent,
    SpecIidComponent,
    SpecRequiredComponent
  ],
  providers: [
    NzModalService
  ],
})
export class TemplatePropertyDetailComponent implements OnInit, OnChanges {

  @Input() editable: boolean = false;
  @Input() service!: ServiceTemplate;
  @Input() property!: PropertyTemplate;
  @Output() changed = new EventEmitter<void>();
  @Output() removed = new EventEmitter<PropertyTemplate>();

  loadingFormats: boolean = false;
  formats: FormatDefinition[] = [];

  loadingUnits: boolean = false;
  units: UnitDefinition[] = [];

  form: FormGroup<{
    required: FormControl<boolean>,
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    access: FormControl<Access>,
    format: FormControl<string>,
    constraint: FormControl<ConstraintType>,
    range: FormControl<RangeValue>,
    list: FormControl<ValueItem[]>,
    hasDefaultValue: FormControl<boolean>,
    members: FormArray<FormGroup<{
      member: FormControl<Member>,
    }>>,
  }>;

  combinationValue: boolean = false;
  constrainable: boolean = false;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private fb: NonNullableFormBuilder,
    private main: MainService,
    protected account: AccountService,
    private msg: NzMessageService,
  ) {
    this.form = this.fb.group({
      required: this.fb.control(true, [Validators.required]),
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9-]*$/)
      ]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      format: this.fb.control('string', [Validators.required]),
      access: this.fb.control(new Access(), [Validators.required]),
      constraint: this.fb.control(ConstraintType.NONE, [Validators.required]),
      range: this.fb.control(new RangeValue()),
      list: this.fb.control<ValueItem[]>([]),
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
    this.loadFormats();
    this.loadUnits();
  }

  private loadUnits(): void {
    this.loadingUnits = true;
    this.main.getUnitDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.units = data;
          this.loadingUnits = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  private loadFormats(): void {
    this.loadingFormats = true;
    this.main.getFormatDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.formats = data;
          this.loadingFormats = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  private reload() {
    this.form.controls.required.setValue(this.service.required);
    this.form.controls.iid.setValue(this.property.iid);
    this.form.controls.ns.setValue(this.property.type.ns);
    this.form.controls.code.setValue(this.property.type.name);
    this.form.controls.description.setValue(this.property.description);
    this.form.controls.format.setValue(this.property.format.toString());
    this.form.controls.access.setValue(this.property.access);
    this.constrainable = this.getConstrainable(this.property.format);
    this.form.controls.constraint.setValue(this.getConstrainType(this.property));

    switch (this.form.controls.constraint.value) {
      case ConstraintType.NONE:
        break;

      case ConstraintType.RANGE:
        const min = this.property.valueRange()?.minValue?.rawValue() || 0;
        const max = this.property.valueRange()?.maxValue?.rawValue() || 0;
        const step = this.property.valueRange()?.stepValue?.rawValue() || 0;
        this.form.controls.range.setValue({min: min, max: max, step: step});
        break;

      case ConstraintType.LIST:
        this.form.controls.list.setValue([]);

        const list = this.property.valueList();
        if (list) {
          // 转换数据格式
          const array: ValueItem[] = list.values.map(value => ValueItem.of(value));
          console.log('Setting list value:', array);
          this.form.controls.list.setValue(array);
        }
        break;
    }

    console.log('init combinationValue');

    this.combinationValue = this.property.format === DataFormat.COMBINATION;
    if (this.combinationValue) {
      console.log('init combinationValue');

      // let members: PropertyDefinition[] = [];
      // for (let member of this.property.members) {
      //   const x = this.propertyMap.get(member.name);
      //   if (x) {
      //     members.push(x);
      //   }
      // }
      //
      // this.form.controls.members.setValue(members);
      console.log('init combinationValue ok');
    }

    // if (p.formatNumber()) {
    //   this.form.controls.unit.setValue(p.unit || '');
    // }

    console.log('init combinationValue ok');
  }

  // get list(): FormArray<FormGroup<{
  //   value: FormControl<number>,
  //   description: FormControl<string>,
  // }>> {
  //   return this.form.controls.list;
  // }

  // get members(): FormArray<FormGroup<{
  //   member: FormControl<Member>
  // }>> {
  //   return this.form.controls.members;
  // }

  protected onRequiredChanged() {
    this.property.required = this.form.value.required || false;
    this.changed.emit()
  }

  protected onFormatChanged() {
    this.constrainable = this.getConstrainable(this.form.controls.format.value);
    this.combinationValue = this.form.controls.format.value === DataFormat.COMBINATION;
    this.changed.emit();
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

  private getConstrainType(p: PropertyTemplate): ConstraintType {
    if (p.hasConstraintValue()) {
      if (p.hasValueRange()) {
        return ConstraintType.RANGE;
      }

      if (p.hasValueList()) {
        return ConstraintType.LIST;
      }
    }

    return ConstraintType.NONE;
  }

  // onConstraintChanged(value: string) {
  //   console.log('onConstraintChanged: ', value);
  //   this.constraintType = value;
  //   this.onChanged();
  // }
  //
  // addValueItem(value: ValueDefinition) {
  //   const v = value.description.get('zh-CN') || value.description.get('en-US') || '?';
  //   this.list.push(this.createValueItem(value.value.rawValue(), v));
  // }
  //
  // addDefaultValueItem() {
  //   this.list.push(this.createValueItem(0, ''));
  //   this.onChanged();
  // }

  // createValueItem(value: number, description: string): FormGroup<{
  //   value: FormControl<number>,
  //   description: FormControl<string>,
  // }> {
  //   return this.fb.group({
  //     value: value,
  //     description: description,
  //   });
  // }
  //
  // removeValueItem(item: FormGroup<{ value: FormControl<number>; description: FormControl<string> }>, i: number) {
  //   console.log('removeValueItem: ' + i);
  //   this.list.removeAt(i);
  //   this.onChanged();
  // }

  // addMemberItem() {
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
  // }

  // addMember(property: Property) {
  //   console.log('addMember: ', property.iid);
  //   this.members.push(this.createMemberItem(property));
  // }
  //
  // createMemberItem(property: Property): FormGroup<{
  //   member: FormControl<Member>,
  // }> {
  //   return this.fb.group({
  //     member: new Member(property, 'zh-CN')
  //   });
  // }
  //
  // removeMemberItem(item: FormGroup<{ member: FormControl<Member> }>, i: number) {
  //   this.members.removeAt(i);
  //   this.onChanged();
  // }

  onRemoved() {
    this.removed.emit(this.property);
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
  protected readonly ConstraintType = ConstraintType;
}
