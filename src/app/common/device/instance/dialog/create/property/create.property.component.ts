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
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {
  Access,
  DataFormat,
  LifeCycle,
  ObjectWithLifecycle,
  Property,
  PropertyDefinition, ValueDefinition, ValueList, ValueRange,
} from '@openxiot/xiot-core-spec-ts';
import {DeviceInstanceDescriptionComponent} from '../../../service/split/detail/property/description/device.instance.description.component';
import {DeviceInstanceIdComponent} from '../../../service/split/detail/property/iid/device.instance.id.component';
import {DeviceInstanceNameComponent} from '../../../service/split/detail/property/name/device.instance.name.component';
import {DeviceInstanceNamespaceComponent} from '../../../service/split/detail/property/namespace/device.instance.namespace.component';
import {NzContentComponent, NzLayoutComponent, NzSiderComponent} from 'ng-zorro-antd/layout';
import {NzMenuDirective, NzMenuDividerDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {MainService} from '../../../../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {DeviceInstanceServicePropertyAccessComponent} from '../../../service/split/detail/property/access/device.instance.service.property.access.component';
import {DeviceInstanceServicePropertyConstraintComponent} from '../../../service/split/detail/property/constraint/device.instance.service.property.constraint.component';
import {DeviceInstanceServicePropertyFormatComponent} from '../../../service/split/detail/property/format/device.instance.service.property.format.component';
import {DeviceInstanceServicePropertyListComponent} from '../../../service/split/detail/property/list/device.instance.service.property.list.component';
import {DeviceInstanceServicePropertyMembersComponent} from '../../../service/split/detail/property/members/device.instance.service.property.members.component';
import {DeviceInstanceServicePropertyRangeComponent} from '../../../service/split/detail/property/range/device.instance.service.property.range.component';
import {ConstraintType} from '../../../service/split/detail/property/constraint/ConstraintType';
import {RangeValue} from '../../../service/split/detail/property/range/RangeValue';
import {ValueItem} from '../../../service/split/detail/property/list/ValueItem';
import {NzFlexModule} from 'ng-zorro-antd/flex';
import {DefaultValue} from '../../../service/split/detail/property/value/DefaultValue';
import {
  DeviceInstanceServicePropertyDefaultValueComponent
} from '../../../service/split/detail/property/value/device.instance.service.property.default.value.component';
import {
  DeviceInstanceServicePropertyUnitComponent
} from '../../../service/split/detail/property/unit/device.instance.service.property.unit.component';

@Component({
  selector: 'create-property',
  styleUrls: ['./create.property.component.less'],
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
    DeviceInstanceDescriptionComponent,
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
    DeviceInstanceServicePropertyMembersComponent,
    DeviceInstanceServicePropertyRangeComponent,
    DeviceInstanceServicePropertyDefaultValueComponent,
    DeviceInstanceServicePropertyUnitComponent,
  ],
  providers: [],
})
export class CreatePropertyComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;
  protected readonly ConstraintType = ConstraintType;

  readonly #modal = inject(NzModalRef);
  readonly data: Property = inject(NZ_MODAL_DATA);

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    format: FormControl<DataFormat>,
    access: FormControl<Access>,
    constraint: FormControl<ConstraintType>,
    range: FormControl<RangeValue>,
    list: FormControl<ValueItem[]>;
    hasDefaultValue: FormControl<boolean>,
    members: FormControl<number[]>,
    unit: FormControl<string>,
    defaultValue: FormControl<DefaultValue>
  }>;
  combinationValue: boolean = false;
  constrainable: boolean = false;

  properties: Property[] = [];
  loading: boolean = true;
  definitions: Map<string, ObjectWithLifecycle<PropertyDefinition>> = new Map<string, ObjectWithLifecycle<PropertyDefinition>>();

  current: Property;

  constructor(
    private main: MainService,
    private msg: NzMessageService,
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      format: this.fb.control(DataFormat.BOOL, [Validators.required]),
      access: this.fb.control(new Access(), [Validators.required]),
      constraint: this.fb.control(ConstraintType.NONE, [Validators.required]),
      range: this.fb.control(new RangeValue()),
      list: this.fb.control<ValueItem[]>([]),
      hasDefaultValue: this.fb.control(false),
      members: this.fb.control<number[]>([]),
      unit: this.fb.control(''),
      defaultValue: this.fb.control(new DefaultValue()),
    });

    this.current = this.data;
  }

  ngOnInit(): void {
    this.loadProperties();
  }

  private loadProperties(): void {
    this.loading = true;
    this.main.getSpecProperties('jd', 1, 200)
      .subscribe({
        next: data => {
          this.definitions = new Map(data.properties.map(item => [item.value.type.name, item]));

          this.properties = data.properties
            .filter(x => x.lifecycle === LifeCycle.RELEASED)
            .map(x => {
              return new Property(
                this.data.iid,
                x.value.type,
                x.value.description,
                x.value.format,
                x.value.access,
                x.value.constraintValue,
                x.value.unit
              );
            });

          this.loading = false;

          this.initFormData(this.data);
        },
        error: error => {
          this.msg.warning('Failed to getSpecProperties: ', error);
        }
      })
  }

  initFormData(property: Property): void {
    this.loading = true;

    this.form.controls.iid.setValue(property.iid);
    this.form.controls.ns.setValue(property.type.ns);
    this.form.controls.code.setValue(property.type.name);
    this.form.controls.description.setValue(property.description);
    this.form.controls.format.setValue(property.format);
    this.form.controls.access.setValue(property.access);
    this.form.controls.constraint.setValue(this.getConstrainType(property));
    this.constrainable = this.toConstrainable(property.format);

    switch (this.form.controls.constraint.value) {
      case ConstraintType.NONE:
        break;

      case ConstraintType.RANGE:
        const min = property.valueRange()?.minValue?.rawValue() || 0;
        const max = property.valueRange()?.maxValue?.rawValue() || 0;
        const step = property.valueRange()?.stepValue?.rawValue() || 0;
        this.form.controls.range.setValue({min: min, max: max, step: step});
        break;

      case ConstraintType.LIST:
        this.form.controls.list.setValue([]);

        const list = property.valueList();
        if (list) {
          // 转换数据格式
          const array: ValueItem[] = list.values.map(value => ValueItem.of(value));
          console.log('Setting list value:', array);
          this.form.controls.list.setValue(array);
        }
        break;
    }

    this.combinationValue = property.format === DataFormat.COMBINATION;
    if (this.combinationValue) {
      console.log('init combinationValue');
      this.form.controls.members.setValue(property.members);
      console.log('init combinationValue ok');
    }

    if (property.formatNumber()) {
      this.form.controls.unit.setValue(property.unit || '');
    }

    if (property.value.defaultValue) {
      this.form.controls.defaultValue.value.value = property.value.defaultValue.rawValue();
      this.form.controls.defaultValue.value.valid = true;
    }

    this.loading = false;
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.data.iid = this.form.controls.iid.value;
    this.data.type.ns = this.form.controls.ns.value;
    this.data.type.value = this.current.type.value;
    this.data.type.name = this.form.controls.code.value;
    this.data.description = this.form.controls.description.value;
    this.data.access.isReadable = this.form.controls.access.value.isReadable;
    this.data.access.isWritable = this.form.controls.access.value.isWritable;
    this.data.access.isNotifiable = this.form.controls.access.value.isNotifiable;
    this.data.format = this.form.controls.format.value;

    switch (this.form.controls.constraint.value) {
      case ConstraintType.NONE:
        this.data.constraintValue = null;
        break;

      case ConstraintType.RANGE:
        const range = [this.form.controls.range.value.min, this.form.controls.range.value.max, this.form.controls.range.value.step];
        this.data.constraintValue = new ValueRange(this.data.format, range);
        break;

      case ConstraintType.LIST:
        const list = new ValueList();

        for (let item of this.form.controls.list.value) {
          const description = new Map<string, string>();
          description.set('zh-CN', item.descriptionZH || 'null');
          description.set('en-US', item.descriptionEN || 'null');
          const value = new ValueDefinition(this.data.format, item.value || 0, description);
          list.values.push(value);
        }

        this.data.constraintValue = list;
        break;
    }

    this.data.unit = this.form.controls.unit.value;

    if (this.form.controls.defaultValue.value.valid) {
      this.data.setDefaultValue(this.form.controls.defaultValue.value.value);
    } else {
      this.data.value.defaultValue = null;
    }

    this.#modal.destroy(this.data);
  }

  protected onClickProperty(p: Property) {
    this.loading = true;
    this.current = p;
    this.initFormData(p);
    this.loading = false;
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

    if (!this.loading) {
      this.combinationValue = this.form.controls.format.value === DataFormat.COMBINATION;
      this.constrainable = this.toConstrainable(this.form.controls.format.value);
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
