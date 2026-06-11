import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewContainerRef} from '@angular/core';
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
  DataFormat,
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

import {ConfirmComponent} from '../../../../../../dialog/confirm/confirm.component';
import {
  DeviceInstanceServicePropertyMembersComponent
} from './members/device.instance.service.property.members.component';
import {DeviceInstanceNamespaceComponent} from './namespace/device.instance.namespace.component';
import {DeviceInstanceIdComponent} from './iid/device.instance.id.component';
import {DeviceInstanceNameComponent} from './name/device.instance.name.component';
import {DeviceInstanceDescriptionComponent} from './description/device.instance.description.component';
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
import {areMapsEqual} from '../../../../../../../typedef/utils/MapUtils';
import {DeviceInstanceServicePropertyUnitComponent} from './unit/device.instance.service.property.unit.component';
import {
  DeviceInstanceServicePropertyDefaultValueComponent
} from './value/device.instance.service.property.default.value.component';
import {DefaultValue} from './value/DefaultValue';

@Component({
  selector: 'device-instance-service-property',
  templateUrl: './device.instance.service.property.component.html',
  styleUrls: ['./device.instance.service.property.component.less'],
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
    DeviceInstanceNamespaceComponent,
    DeviceInstanceServicePropertyMembersComponent,
    DeviceInstanceIdComponent,
    DeviceInstanceNameComponent,
    DeviceInstanceDescriptionComponent,
    DeviceInstanceServicePropertyAccessComponent,
    DeviceInstanceServicePropertyFormatComponent,
    DeviceInstanceServicePropertyConstraintComponent,
    DeviceInstanceServicePropertyRangeComponent,
    DeviceInstanceServicePropertyListComponent,
    DeviceInstanceServicePropertyUnitComponent,
    DeviceInstanceServicePropertyDefaultValueComponent,
  ],
  providers: [
    NzModalService
  ],
})
export class DeviceInstanceServicePropertyComponent implements OnChanges {

  protected readonly ConstraintType = ConstraintType;
  protected readonly LifeCycle = LifeCycle;
  private loading: boolean = false;

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Input() service!: Service;
  @Input() property!: Property;
  @Input() language!: string;
  @Output() removed = new EventEmitter<Property>();
  @Output() changed = new EventEmitter<Property>();

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

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property']) {
      this.reload();
    }
  }

  protected get updatable(): boolean {
    if (this.property) {
      return this.property.type.ns === this.property.type.organization;
    }

    return false;
  }

  private reload() {
    console.log('reload');

    this.loading = true;

    this.form.controls.iid.setValue(this.property.iid);
    this.form.controls.ns.setValue(this.property.type.ns);
    this.form.controls.code.setValue(this.property.type.name);
    this.form.controls.description.setValue(this.property.description);
    this.form.controls.format.setValue(this.property.format);
    this.form.controls.access.setValue(this.property.access);
    this.form.controls.constraint.setValue(this.getConstrainType(this.property));
    this.constrainable = this.toConstrainable(this.property.format);

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

    this.combinationValue = this.property.format === DataFormat.COMBINATION;
    if (this.combinationValue) {
      console.log('init combinationValue');
      this.form.controls.members.setValue(this.property.members);
      console.log('init combinationValue ok');
    }

    if (this.property.formatNumber()) {
      this.form.controls.unit.setValue(this.property.unit || '');
    }

    if (this.property.value.defaultValue) {
      this.form.controls.defaultValue.value.value = this.property.value.defaultValue.rawValue();
      this.form.controls.defaultValue.value.valid = true;
    }

    // ValueList渲染完成，需要时间，如果loading已经是true，则onConstraintListChanged会传到到最上层。
    setTimeout(() => { this.loading = false;}, 100);
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

  onRemoved() {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: '您真的要删除这个属性吗？',
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.property.description.get('zh-CN'),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '确认',
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.removed.emit(this.property);
      }
    });
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');

    if (! this.loading) {
      if (this.property.iid !== this.form.controls.iid.value) {
        this.property.iid = this.form.controls.iid.value;
        this.changed.emit(this.property);
      }
    }
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');

    if (!this.loading) {
      if (this.property.type.name !== this.form.controls.code.value) {
        this.property.type.name = this.form.controls.code.value;
        this.changed.emit(this.property);
      }
    }
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');

    if (!this.loading) {
      const value: Map<string, string> = this.form.controls.description.value;
      if (! areMapsEqual(this.property.description, value)) {
        this.property.description = value;
        this.changed.emit(this.property);
      }
    }
  }

  protected onAccessChanged(): void {
    console.log('onAccessChanged');

    if (!this.loading) {
      if (
        this.property.access.isReadable !== this.form.controls.access.value.isReadable ||
        this.property.access.isWritable !== this.form.controls.access.value.isWritable ||
        this.property.access.isNotifiable !== this.form.controls.access.value.isNotifiable
      ) {
        this.property.access.isReadable = this.form.controls.access.value.isReadable;
        this.property.access.isWritable = this.form.controls.access.value.isWritable;
        this.property.access.isNotifiable = this.form.controls.access.value.isNotifiable;
        this.changed.emit(this.property);
      }
    }
  }

  protected onFormatChanged(): void {
    console.log('onFormatChanged');

    if (!this.loading) {
      if (this.property.format !== this.form.controls.format.value) {
        this.property.format = this.form.controls.format.value;
        this.combinationValue = this.form.controls.format.value === DataFormat.COMBINATION;
        this.constrainable = this.toConstrainable(this.form.controls.format.value);
        this.changed.emit(this.property);
      }
    }
  }

  protected onConstraintTypeChanged(): void {
    console.log('onConstraintTypeChanged');

    if (!this.loading) {
      this.property.constraintValue = null;
      this.changed.emit(this.property);
    }
  }

  protected onConstraintRangeChanged(): void {
    console.log('onConstraintRangeChanged');

    if (!this.loading) {
      const range = [this.form.controls.range.value.min, this.form.controls.range.value.max, this.form.controls.range.value.step];
      this.property.constraintValue = new ValueRange(this.property.format, range);
      this.changed.emit(this.property);
    }
  }

  protected onConstraintListChanged(): void {
    console.log('onConstraintListChanged');

    if (!this.loading) {
      const list = new ValueList();

      for (let item of this.form.controls.list.value) {
        const description = new Map<string, string>();
        description.set('en-US', item.descriptionEN || 'null');
        description.set('zh-CN', item.descriptionZH || 'null');
        const value = new ValueDefinition(this.property.format, item.value || 0, description);
        list.values.push(value);
      }

      this.property.constraintValue = list;

      this.changed.emit(this.property);
    }
  }

  protected onMembersChanged(): void {
    console.log('onMembersChanged');

    if (!this.loading) {
      if (this.combinationValue) {
        if (!this.arraysEqualEvery(this.property.members, this.form.controls.members.value)) {
          this.property.members = this.form.controls.members.value;
          this.changed.emit(this.property);
        }
      }
    }
  }

  protected onUnitChanged(): void {
    console.log('onUnitChanged');

    if (!this.loading) {
      if (this.property.unit !== this.form.controls.unit.value) {
        this.property.unit = this.form.controls.unit.value;
        this.changed.emit(this.property);
      }
    }
  }

  protected onDefaultValueChanged(): void {
    console.log('onDefaultValueChanged');

    if (!this.loading) {

      if (this.form.controls.defaultValue.value.valid) {
        this.property.setDefaultValue(this.form.controls.defaultValue.value.value);
      } else {
        this.property.value.defaultValue = null;
      }

      this.changed.emit(this.property);
    }
  }

  private arraysEqualEvery(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  protected readonly Property = Property;
  protected readonly DataFormat = DataFormat;
}
