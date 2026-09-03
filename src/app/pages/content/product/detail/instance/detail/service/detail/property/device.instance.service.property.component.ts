import {Component, computed, effect, EventEmitter, input, Output, signal, ViewContainerRef} from '@angular/core';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';

import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  Access,
  ConstraintValue,
  DataFormat,
  DataFormatFromString,
  FormatDefinition,
  LifeCycle,
  Property,
  Service,
  ValueDefinition,
  ValueList,
  ValueRange
} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';

import {ConfirmComponent} from '../../../../../../../../../common/dialog/confirm/confirm.component';
import {MainI18nService} from '../../../../../../../../../service/i18n.service';
import {
  DeviceInstanceServicePropertyMembersComponent
} from './members/device.instance.service.property.members.component';
import {DeviceInstanceIdComponent} from './iid/device.instance.id.component';
import {DeviceInstanceNameComponent} from './name/device.instance.name.component';
import {DescriptionComponent} from '../../../../../../../../../common/form/item/common/description/description.component';
import {DeviceInstanceServicePropertyAccessComponent} from './access/device.instance.service.property.access.component';
import {DeviceInstanceServicePropertyFormatComponent} from './format/device.instance.service.property.format.component';
import {
  DeviceInstanceServicePropertyConstraintComponent
} from './constraint/device.instance.service.property.constraint.component';
import {DeviceInstanceServicePropertyRangeComponent} from './range/device.instance.service.property.range.component';
import {ConstraintType} from './constraint/ConstraintType';
import {RangeValue} from './range/RangeValue';
import {ValueItem} from './list/ValueItem';
import {DeviceInstanceServicePropertyListComponent} from './list/device.instance.service.property.list.component';
import {DeviceInstanceServicePropertyUnitComponent} from './unit/device.instance.service.property.unit.component';
import {
  DeviceInstanceServicePropertyDefaultValueComponent
} from './value/device.instance.service.property.default.value.component';
import {DefaultValue} from './value/DefaultValue';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {TranslatePipe} from '@ngx-translate/core';
import {InstanceOp, PropertyPatch} from '../../../../../../../../../typedef/instance/InstanceEditor';

@Component({
  selector: 'device-instance-service-property',
  templateUrl: './device.instance.service.property.component.html',
  styleUrl: './device.instance.service.property.component.less',
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
    DeviceInstanceServicePropertyMembersComponent,
    DeviceInstanceIdComponent,
    DeviceInstanceNameComponent,
    DescriptionComponent,
    DeviceInstanceServicePropertyAccessComponent,
    DeviceInstanceServicePropertyFormatComponent,
    DeviceInstanceServicePropertyConstraintComponent,
    DeviceInstanceServicePropertyRangeComponent,
    DeviceInstanceServicePropertyListComponent,
    DeviceInstanceServicePropertyUnitComponent,
    DeviceInstanceServicePropertyDefaultValueComponent,
    NzFlexDirective,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class DeviceInstanceServicePropertyComponent {

  protected readonly ConstraintType = ConstraintType;
  protected readonly LifeCycle = LifeCycle;

  editable = input(false);
  service = input.required<Service>();
  property = input.required<Property>();
  formats = input.required<FormatDefinition[]>();

  @Output() op = new EventEmitter<InstanceOp>();

  /** 子 CVA 仍按 lifecycle 门控：可编辑 ⇔ 组织匹配且 DEV，否则喂 RELEASED（只读）。 */
  protected subLifecycle = computed(() => this.editable() ? LifeCycle.DEVELOPMENT : LifeCycle.RELEASED);

  /** 当前界面语言（叶子不再从父级收 language，直接取 i18n）。 */
  protected get language(): string {
    return this.i18n.getCurrentLang();
  }

  form: FormGroup<{
    iid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    format: FormControl<string>,
    access: FormControl<Access>,
    constraint: FormControl<ConstraintType>,
    range: FormControl<RangeValue>,
    list: FormControl<ValueItem[]>;
    members: FormControl<number[]>,
    unit: FormControl<string>,
    defaultValue: FormControl<DefaultValue>
  }>;

  combinationValue: boolean = false;
  constrainable: boolean = false;

  /**
   * property-list 在 writeValue() 回填行时会经内部 FormArray.valueChanges 连发 changed，
   * 而 reload 是用 setValue() 回填的（程序性写入），这些回声必须抑制，否则会在打开/切换节点时
   * 用半成品行误发 updateProperty 覆盖模型。
   */
  private suppressListEmit: boolean = false;

  /** 已加载的属性 iid：只在切到别的节点时 reload，同 iid 自提交（含逐键描述）不复位表单。 */
  private loadedIid: number | undefined = undefined;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private fb: NonNullableFormBuilder,
    public i18n: MainI18nService
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      format: this.fb.control<string>(DataFormat.BOOL.toString(), [Validators.required]),
      access: this.fb.control(new Access(), [Validators.required]),
      constraint: this.fb.control(ConstraintType.NONE, [Validators.required]),
      range: this.fb.control(new RangeValue()),
      list: this.fb.control<ValueItem[]>([]),
      members: this.fb.control<number[]>([]),
      unit: this.fb.control(''),
      defaultValue: this.fb.control(new DefaultValue()),
    });

    effect(() => {
      const p = this.property();
      if (p && this.loadedIid !== p.iid) {
        this.loadedIid = p.iid;
        this.reload();
      }
    });
  }

  private reload() {
    const p = this.property();
    if (!p) return;

    this.suppressListEmit = true;
    setTimeout(() => { this.suppressListEmit = false; });

    this.form.controls.iid.setValue(p.iid);
    this.form.controls.code.setValue(p.type.name);
    this.form.controls.description.setValue(p.description);
    this.form.controls.format.setValue(p.format.toString());
    this.form.controls.access.setValue(p.access);
    this.constrainable = this.toConstrainable(p.format);
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

    this.combinationValue = p.format === DataFormat.COMBINATION;
    if (this.combinationValue) {
      console.log('init combinationValue');
      this.form.controls.members.setValue(p.members ? [...p.members] : []);
    }

    if (p.formatNumber()) {
      this.form.controls.unit.setValue(p.unit || '');
    }

    // 缺省值：默认「无」，有 defaultValue 时回填 value。
    const dv = new DefaultValue();
    if (p.value.defaultValue) {
      dv.valid = true;
      dv.value = p.value.defaultValue.rawValue();
    }
    this.form.controls.defaultValue.setValue(dv);
  }

  protected get updatable(): boolean {
    const p = this.property();
    return p.type.ns === p.type.organization;
  }

  private toConstrainable(format: string): boolean {
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

  private getConstrainType(p: Property): ConstraintType {
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
   * 按当前 constraint 模式 + 当前 format 序列化取值约束。
   *  - NONE → null
   *  - RANGE → new ValueRange(format, [min, max, step])
   *  - LIST  → new ValueList()，每行 new ValueDefinition(format, item.value, desc)
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
          const description = new Map<string, string>();
          description.set('en-US', item.descriptionEN || 'null');
          description.set('zh-CN', item.descriptionZH || 'null');
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
          ctrl.list.setValue([new ValueItem(0, '', '')]);
        }
        break;

      default:
        break;
    }
  }

  onRemoved() {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个属性吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.property().description.get('zh-CN') || '?',
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.op.emit({kind: 'removeProperty', serviceIid: this.service().iid, piid: this.property().iid});
      }
    });
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');

    if (this.property().iid !== this.form.controls.iid.value) {
      this.emitPropertyPatch({iid: this.form.controls.iid.value});
    }
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');

    if (this.property().type.name !== this.form.controls.code.value) {
      this.emitPropertyPatch({name: this.form.controls.code.value});
    }
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');

    this.emitPropertyPatch({description: this.form.controls.description.value});
  }

  protected onAccessChanged(): void {
    console.log('onAccessChanged');

    const a = this.form.controls.access.value;
    // 逐位克隆成新 Access：控制值/CVA 内部与模型不再共享同一个 Access 对象。
    this.emitPropertyPatch({access: Access.of(a.isReadable, a.isWritable, a.isNotifiable)});
  }

  protected onFormatChanged(): void {
    console.log('onFormatChanged');

    const format = DataFormatFromString(this.form.controls.format.value);
    this.combinationValue = format === DataFormat.COMBINATION;
    this.constrainable = this.toConstrainable(format);
    // 格式一变，旧 format 的 ValueRange/ValueList 就失效，需按新格式重序列化约束。
    // 若新格式不可约束（bool/string/hex/combination/...），约束模式一并清掉——既符合
    // 「旧约束随格式失效」，也避免用不可约束格式重建 ValueRange/ValueList（构造器会抛错）。
    if (!this.constrainable && this.form.controls.constraint.value !== ConstraintType.NONE) {
      this.form.controls.constraint.setValue(ConstraintType.NONE);
    }
    this.emitPropertyPatch({
      format,
      constraintValue: this.serializeConstraint(),
    });
  }

  protected onConstraintChanged(): void {
    console.log('onConstraintChanged');

    this.seedConstraintDefaults();
    this.emitPropertyPatch({constraintValue: this.serializeConstraint()});
  }

  protected onRangeChanged(): void {
    console.log('onRangeChanged');

    this.emitPropertyPatch({constraintValue: this.serializeConstraint()});
  }

  protected onListChanged(): void {
    console.log('onListChanged');

    if (this.suppressListEmit) {
      return;
    }
    this.emitPropertyPatch({constraintValue: this.serializeConstraint()});
  }

  protected onMembersChanged(): void {
    console.log('onMembersChanged');

    if (this.combinationValue) {
      this.emitPropertyPatch({members: [...this.form.controls.members.value]});
    }
  }

  protected onUnitChanged(): void {
    console.log('onUnitChanged');

    this.emitPropertyPatch({unit: this.form.controls.unit.value});
  }

  protected onDefaultValueChanged(): void {
    console.log('onDefaultValueChanged');

    const dv = this.form.controls.defaultValue.value;
    if (dv.valid) {
      this.emitPropertyPatch({defaultValue: dv.value});
    } else {
      this.emitPropertyPatch({defaultValue: null});
    }
  }

  protected readonly Property = Property;
  protected readonly DataFormat = DataFormat;
}
