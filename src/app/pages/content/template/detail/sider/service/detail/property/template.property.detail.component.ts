import {
  Component,
  effect,
  EventEmitter,
  input,
  OnInit,
  Output,
  signal,
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
import {ConstraintValue, DataFormat, DataFormatFromString, ServiceTemplate, PropertyTemplate, FormatDefinition, UnitDefinition, Access, ValueDefinition, ValueList, ValueRange} from '@openxiot/xiot-core-spec-ts';
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
import {PropertyPatch, TemplateOp} from '../../../../../../../../typedef/template/TemplateEditor';

@Component({
  selector: 'template-property-detail',
  templateUrl: './template.property.detail.component.html',
  styleUrl: './template.property.detail.component.less',
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
export class TemplatePropertyDetailComponent implements OnInit {

  editable = input(false);
  service = input.required<ServiceTemplate>();
  property = input.required<PropertyTemplate>();
  @Output() op = new EventEmitter<TemplateOp>();

  loadingFormats: boolean = false;
  formats = signal<FormatDefinition[]>([]);

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

  /**
   * property-list 在 writeValue() 回填行时会经内部 formArray.valueChanges 连发 changed，
   * 而 reload 是用 setValue() 回填的（程序性写入），这些回声必须抑制，否则会在打开/切换节点时
   * 用半成品行误发 updateProperty 覆盖模型。Zoneless 用微任务调度渲染，setTimeout(0) 一定在
   * reload 之后那次渲染（含挂载 list CVA 的 writeValue）全部完成之后才复位。
   */
  private suppressListEmit: boolean = false;

  /** 已加载的属性 iid：只在切到别的节点时 reload，同 iid 自提交（含逐键描述）不复位表单。 */
  private loadedIid: number | undefined = undefined;

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
        Validators.pattern(/^[a-z][a-z0-9-]*$/)
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

    effect(() => {
      const p = this.property();
      if (p && this.loadedIid !== p.iid) {
        this.loadedIid = p.iid;
        this.reload();
      }
    });
  }

  ngOnInit(): void {
    const p = this.property();
    if (p && this.loadedIid !== p.iid) {
      this.loadedIid = p.iid;
      this.reload();
    }
    this.loadFormats();
    this.loadUnits();
  }

  private loadUnits(): void {
    this.loadingUnits = true;
    this.main.getUnitDefinitions(this.account.ns().namespace)
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
    this.main.getFormatDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.formats.set(data);
          this.loadingFormats = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  private reload() {
    const p = this.property();
    if (!p) return;

    this.suppressListEmit = true;
    setTimeout(() => {
      this.suppressListEmit = false;
    });

    this.form.controls.required.setValue(p.required);
    this.form.controls.iid.setValue(p.iid);
    this.form.controls.ns.setValue(p.type.ns);
    this.form.controls.code.setValue(p.type.name);
    this.form.controls.description.setValue(p.description);
    this.form.controls.format.setValue(p.format.toString());
    this.form.controls.access.setValue(p.access);
    this.constrainable = this.getConstrainable(p.format);
    this.form.controls.constraint.setValue(this.getConstrainType(p));

    switch (this.form.controls.constraint.value) {
      case ConstraintType.NONE:
        break;

      case ConstraintType.RANGE:
        const min = p.valueRange()?.minValue?.rawValue() || 0;
        const max = p.valueRange()?.maxValue?.rawValue() || 0;
        const step = p.valueRange()?.stepValue?.rawValue() || 0;
        this.form.controls.range.setValue({min: min, max: max, step: step});
        break;

      case ConstraintType.LIST:
        this.form.controls.list.setValue([]);

        const list = p.valueList();
        if (list) {
          // 转换数据格式
          const array: ValueItem[] = list.values.map(value => ValueItem.of(value));
          console.log('Setting list value:', array);
          this.form.controls.list.setValue(array);
        }
        break;
    }

    console.log('init combinationValue');

    this.combinationValue = p.format === DataFormat.COMBINATION;
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
    this.op.emit({
      kind: 'updateProperty',
      serviceIid: this.service().iid,
      piid: this.property().iid,
      patch: {required: this.form.value.required || false},
    });
  }

  /** 每个控件把新值写进 control 后才 (changed)，所以 handler 读 control 即为最新值。 */
  private emitPropertyPatch(patch: PropertyPatch) {
    this.op.emit({
      kind: 'updateProperty',
      serviceIid: this.service().iid,
      piid: this.property().iid,
      patch,
    });
  }

  /**
   * 按当前 constraint 模式 + 当前 format 序列化取值约束（映射复用 spec/property/create 的 submitForm）。
   *  - NONE → null
   *  - RANGE → new ValueRange(format, [min, max, step])
   *  - LIST  → new ValueList()，每行 new ValueDefinition(format, item.value, item.desc)
   */
  private serializeConstraint(): ConstraintValue | null {
    const format = DataFormatFromString(this.form.controls.format.value);
    switch (this.form.controls.constraint.value) {
      case ConstraintType.RANGE: {
        const range = this.form.controls.range.value ?? new RangeValue();
        const min = range.min ?? 0;
        const max = range.max ?? 100;
        const step = range.step ?? 1;
        return new ValueRange(format, [min, max, step]);
      }

      case ConstraintType.LIST: {
        const list = new ValueList();
        for (const item of this.form.controls.list.value) {
          const description = item.desc ?? new Map<string, string>();
          list.values.push(new ValueDefinition(format, item.value || 0, description));
        }
        return list;
      }

      case ConstraintType.NONE:
      default:
        return null;
    }
  }

  /**
   * NONE→RANGE/LIST（或 RANGE↔LIST）切换时，目标控件可能还没有可用数据：
   * 给一个合理默认值，避免序列化出空 ValueRange / 空 ValueList 把模型覆盖掉。
   */
  private seedConstraintDefaults(): void {
    const ctrl = this.form.controls;
    switch (ctrl.constraint.value) {
      case ConstraintType.RANGE:
        if (!ctrl.range.value) {
          ctrl.range.setValue(new RangeValue());
        }
        break;

      case ConstraintType.LIST:
        if (!ctrl.list.value || ctrl.list.value.length === 0) {
          ctrl.list.setValue([new ValueItem(0, new Map([['en-US', '']]))]);
        }
        break;

      default:
        break;
    }
  }

  protected onIIDChanged() {
    this.emitPropertyPatch({iid: this.form.controls.iid.value});
  }

  protected onDescriptionChanged() {
    this.emitPropertyPatch({description: this.form.controls.description.value});
  }

  protected onAccessChanged() {
    this.emitPropertyPatch({access: this.form.controls.access.value});
  }

  protected onFormatChanged() {
    const format = this.form.controls.format.value;
    this.constrainable = this.getConstrainable(format);
    this.combinationValue = format === DataFormat.COMBINATION;
    // 格式一变，旧 format 的 ValueRange/ValueList 就失效，需按新格式重序列化约束。
    // 若新格式不可约束（bool/string/hex/combination/...），约束模式一并清掉——既符合
    // 「旧约束随格式失效」，也避免用不可约束格式重建 ValueRange/ValueList（构造器会抛错）。
    if (!this.constrainable && this.form.controls.constraint.value !== ConstraintType.NONE) {
      this.form.controls.constraint.setValue(ConstraintType.NONE);
    }
    this.emitPropertyPatch({
      format: DataFormatFromString(format),
      constraintValue: this.serializeConstraint(),
    });
  }

  protected onConstraintChanged() {
    this.seedConstraintDefaults();
    this.emitPropertyPatch({constraintValue: this.serializeConstraint()});
  }

  protected onRangeChanged() {
    this.emitPropertyPatch({constraintValue: this.serializeConstraint()});
  }

  protected onListChanged() {
    // reload 回填行(writeValue) 触发的回声在 suppressListEmit 置位期间被忽略。
    if (this.suppressListEmit) {
      return;
    }
    this.emitPropertyPatch({constraintValue: this.serializeConstraint()});
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
    this.op.emit({kind: 'removeProperty', serviceIid: this.service().iid, piid: this.property().iid});
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
