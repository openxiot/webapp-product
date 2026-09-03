import {Component, inject, OnInit, signal} from '@angular/core';
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
import {
  Access,
  DataFormat,
  DataFormatFromString,
  FormatDefinition,
  LifeCycle,
  Property,
  PropertyDefinition, PropertyType, ValueDefinition, ValueList, ValueRange,
} from '@openxiot/xiot-core-spec-ts';
import {DeviceInstanceIdComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/iid/device.instance.id.component';
import {DeviceInstanceNameComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/name/device.instance.name.component';
import {DeviceInstanceNamespaceComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/namespace/device.instance.namespace.component';
import {NzContentComponent, NzLayoutComponent, NzSiderComponent} from 'ng-zorro-antd/layout';
import {NzMenuDirective, NzMenuDividerDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {MainService} from '../../../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {DeviceInstanceServicePropertyAccessComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/access/device.instance.service.property.access.component';
import {DeviceInstanceServicePropertyConstraintComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/constraint/device.instance.service.property.constraint.component';
import {DeviceInstanceServicePropertyFormatComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/format/device.instance.service.property.format.component';
import {DeviceInstanceServicePropertyListComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/list/device.instance.service.property.list.component';
import {DeviceInstanceServicePropertyRangeComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/range/device.instance.service.property.range.component';
import {ConstraintType} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/constraint/ConstraintType';
import {RangeValue} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/range/RangeValue';
import {ValueItem} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/list/ValueItem';
import {NzFlexModule} from 'ng-zorro-antd/flex';
import {DefaultValue} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/value/DefaultValue';
import {
  DeviceInstanceServicePropertyUnitComponent
} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/unit/device.instance.service.property.unit.component';
import {
  DeviceInstanceServicePropertyDefaultValueComponent
} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/value/device.instance.service.property.default.value.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {PropertyOption} from './PropertyOption';
import {MainI18nService} from '../../../../../service/i18n.service';
import {DescriptionComponent} from '../../../../form/item/common/description/description.component';

@Component({
  selector: 'create-property',
  styleUrl: './create.property.component.less',
  templateUrl: './create.property.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzColDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzRowDirective,
    DeviceInstanceIdComponent,
    DeviceInstanceNameComponent,
    DeviceInstanceNamespaceComponent,
    NzContentComponent,
    NzLayoutComponent,
    NzMenuDirective,
    NzMenuDividerDirective,
    NzMenuItemComponent,
    NzSiderComponent,
    NzSpinComponent,
    NzFlexModule,
    DeviceInstanceServicePropertyAccessComponent,
    DeviceInstanceServicePropertyConstraintComponent,
    DeviceInstanceServicePropertyFormatComponent,
    DeviceInstanceServicePropertyListComponent,
    DeviceInstanceServicePropertyRangeComponent,
    DeviceInstanceServicePropertyDefaultValueComponent,
    DeviceInstanceServicePropertyUnitComponent,
    TranslatePipe,
    DescriptionComponent,
  ],
  providers: [],
})
export class CreatePropertyComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;
  protected readonly ConstraintType = ConstraintType;

  readonly #modal = inject(NzModalRef);
  readonly option: PropertyOption = inject(NZ_MODAL_DATA);

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    format: FormControl<string>,
    access: FormControl<Access>,
    constraint: FormControl<ConstraintType>,
    range: FormControl<RangeValue>,
    list: FormControl<ValueItem[]>;
    hasDefaultValue: FormControl<boolean>,
    members: FormControl<number[]>,
    unit: FormControl<string>,
    defaultValue: FormControl<DefaultValue>
  }>;
  combinationValue = signal(false);
  constrainable = signal(false);

  custom: Property;
  properties = signal<Property[]>([]);
  selected: Property;

  loading = signal(true);
  definitions: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingFormats = signal(false);
  formats = signal<FormatDefinition[]>([]);

  constructor(
    public i18n: MainI18nService,
    private account: AccountService,
    private main: MainService,
    private msg: NzMessageService,
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      format: this.fb.control<string>(DataFormat.BOOL.toString(), [Validators.required]),
      access: this.fb.control(new Access(), [Validators.required]),
      constraint: this.fb.control(ConstraintType.NONE, [Validators.required]),
      range: this.fb.control(new RangeValue()),
      list: this.fb.control<ValueItem[]>([]),
      hasDefaultValue: this.fb.control(false),
      members: this.fb.control<number[]>([]),
      unit: this.fb.control(''),
      defaultValue: this.fb.control(new DefaultValue()),
    });

    this.custom = this.createCustomProperty();
    this.selected = this.custom;
  }

  private createCustomProperty(): Property {
    const org = this.option.type.organization || 'org';
    const model = this.option.type.model || 'model';
    const version = this.option.type.version || 0;
    const type = new PropertyType(`urn:${org}:property:unnamed:00000000:${org}:${model}:${version}`);
    const description = new Map<string, string>();
    description.set(this.i18n.getCurrentLang(), this.i18n.translate.instant('自定义属性'));
    const format = DataFormat.BOOL;
    const access = Access.of(true, true, true);
    const constraintValue = null;
    const unit = null;

    return new Property(this.option.iid, type, description, format, access, constraintValue, unit)
  }

  ngOnInit(): void {
    this.loadProperties();
    this.loadFormats();
  }

  private loadFormats(): void {
    this.loadingFormats.set(true);
    this.main.getFormatDefinitions(this.option.type.ns)
      .subscribe({
        next: data => {
          this.formats.set(data);
          this.loadingFormats.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loadingFormats.set(false);
        }
      })
  }

  private loadProperties(): void {
    this.loading.set(true);
    this.main.getPropertyDefinitions(this.option.type.ns)
      .subscribe({
        next: data => {
          this.definitions = new Map(data.map(item => [item.type.name, item]));

          this.properties.set(data
            .filter(x => x.lifecycle === LifeCycle.RELEASED)
            .map(x => {
              return new Property(
                this.option.iid,
                x.type,
                x.description,
                x.format,
                x.access,
                x.constraintValue,
                x.unit
              );
            }));

          this.initFormData();

          this.loading.set(false);
        },
        error: error => {
          console.log(error);
          this.initFormData();
          this.loading.set(false);
        }
      })
  }

  initFormData(): void {
    this.loading.set(true);

    const description: Map<string, string> = new Map<string, string>();
    description.set(this.i18n.getCurrentLang(), this.selected.description.get(this.i18n.getCurrentLang()) || '');

    this.form.controls.iid.setValue(this.selected.iid);
    this.form.controls.ns.setValue(this.selected.type.ns);
    this.form.controls.code.setValue(this.selected.type.name);
    this.form.controls.description.setValue(description);
    this.form.controls.format.setValue(this.selected.format);
    this.form.controls.access.setValue(this.selected.access);
    this.form.controls.constraint.setValue(this.getConstrainType(this.selected));
    this.constrainable.set(this.toConstrainable(this.selected.format));

    switch (this.form.controls.constraint.value) {
      case ConstraintType.NONE:
        break;

      case ConstraintType.RANGE:
        const min = this.selected.valueRange()?.minValue?.rawValue() || 0;
        const max = this.selected.valueRange()?.maxValue?.rawValue() || 0;
        const step = this.selected.valueRange()?.stepValue?.rawValue() || 0;
        this.form.controls.range.setValue({min: min, max: max, step: step});
        break;

      case ConstraintType.LIST:
        this.form.controls.list.setValue([]);

        const list = this.selected.valueList();
        if (list) {
          // 转换数据格式
          const array: ValueItem[] = list.values.map(value => ValueItem.of(value));
          console.log('Setting list value:', array);
          this.form.controls.list.setValue(array);
        }
        break;
    }

    this.combinationValue.set(this.selected.format === DataFormat.COMBINATION);
    if (this.combinationValue()) {
      console.log('init combinationValue');
      this.form.controls.members.setValue(this.selected.members);
      console.log('init combinationValue ok');
    }

    if (this.selected.formatNumber()) {
      this.form.controls.unit.setValue(this.selected.unit || '');
    }

    if (this.selected.value.defaultValue) {
      this.form.controls.defaultValue.defaultValue.value = this.selected.value.defaultValue.rawValue();
      this.form.controls.defaultValue.defaultValue.valid = true;
    }

    this.loading.set(false);
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.selected.iid = this.form.controls.iid.value;
    this.selected.type.ns = this.form.controls.ns.value;
    this.selected.type.name = this.form.controls.code.value;
    this.selected.description = this.form.controls.description.value;
    this.selected.access.isReadable = this.form.controls.access.defaultValue.isReadable;
    this.selected.access.isWritable = this.form.controls.access.defaultValue.isWritable;
    this.selected.access.isNotifiable = this.form.controls.access.defaultValue.isNotifiable;
    this.selected.format = DataFormatFromString(this.form.controls.format.value);

    switch (this.form.controls.constraint.value) {
      case ConstraintType.NONE:
        this.selected.constraintValue = null;
        break;

      case ConstraintType.RANGE:
        const range = [this.form.controls.range.defaultValue.min, this.form.controls.range.defaultValue.max, this.form.controls.range.defaultValue.step];
        this.selected.constraintValue = new ValueRange(this.selected.format, range);
        break;

      case ConstraintType.LIST:
        const list = new ValueList();

        for (let item of this.form.controls.list.value) {
          const description = new Map<string, string>();
          description.set('zh-CN', item.descriptionZH || 'null');
          description.set('en-US', item.descriptionEN || 'null');
          const value = new ValueDefinition(this.selected.format, item.value || 0, description);
          list.values.push(value);
        }

        this.selected.constraintValue = list;
        break;
    }

    this.selected.unit = this.form.controls.unit.value;

    // if (this.form.controls.defaultValue.valid) {
    //   this.selected.setDefaultValue(this.form.controls.defaultValue.value);
    // } else {
    //   this.selected.setDefaultValue(null);
    // }

    this.#modal.destroy(this.selected);
  }

  protected onClickProperty(p: Property) {
    this.selected = p;
    this.initFormData();
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');
  }

  protected onAccessChanged(): void {
    console.log('onAccessChanged');
  }

  protected onFormatChanged(): void {
    console.log('onFormatChanged');

    if (!this.loading()) {
      this.combinationValue.set(DataFormatFromString(this.form.controls.format.value) === DataFormat.COMBINATION);
      this.constrainable.set(this.toConstrainable(this.form.controls.format.value));
    }
  }

  protected onConstraintTypeChanged(): void {
    console.log('onConstraintTypeChanged');
  }

  protected onConstraintRangeChanged(): void {
    console.log('onConstraintRangeChanged');
  }

  protected onConstraintListChanged(): void {
    console.log('onConstraintListChanged');
  }

  protected onMembersChanged(): void {
    console.log('onMembersChanged');
  }

  protected onUnitChanged(): void {
    console.log('onUnitChanged');
  }

  protected onDefaultValueChanged(): void {
    console.log('onDefaultValueChanged');
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

  private getConstrainType(property: Property): ConstraintType {
    if (property.hasConstraintValue()) {
      if (property.hasValueRange()) {
        return ConstraintType.RANGE;
      }

      if (property.hasValueList()) {
        return ConstraintType.LIST;
      }
    }

    return ConstraintType.NONE;
  }

  protected readonly DataFormat = DataFormat;
}
