import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzStepsModule} from 'ng-zorro-antd/steps';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {
  Access,
  DataFormat, LifeCycle,
  PropertyDefinition,
  PropertyType,
  UrnType, ValueDefinition, ValueList,
  ValueRange
} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {DescriptionComponent} from '../../../../../common/form/item/common/description/description.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {CodeComponent} from '../../../../../common/form/item/common/code/code.component';
import {PropertyFormatComponent} from '../../../../../common/form/item/property/format/property.format.component';
import {PropertyAccessComponent} from '../../../../../common/form/item/property/access/property.access.component';
import {PropertyUnitComponent} from '../../../../../common/form/item/property/unit/property.unit.component';
import {RangeValue} from '../../../../../common/form/item/property/range/RangeValue';
import {ValueItem} from '../../../../../common/form/item/property/list/ValueItem';
import {ConstraintType} from '../../../../../common/form/item/property/constraint/ConstraintType';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {
  PropertyConstraintComponent
} from '../../../../../common/form/item/property/constraint/property.constraint.component';
import {PropertyRangeComponent} from '../../../../../common/form/item/property/range/property.range.component';
import {PropertyListComponent} from '../../../../../common/form/item/property/list/property.list.component';
import {
  PropertyDefMembersComponent
} from '../../../../../common/form/item/property/members/property.def.members.component';
import {UuidComponent} from '../../../../../common/form/item/common/uuid/uuid.component';
import {LifecycleComponent} from '../../../../../common/form/item/common/lifecycle/lifecycle.component';

@Component({
  selector: 'spec-property-create',
  standalone: true,
  templateUrl: './spec.property.create.component.html',
  styleUrls: ['./spec.property.create.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzStepsModule,
    NzSpaceModule,
    NzDividerModule,
    ReactiveFormsModule,
    DescriptionComponent,
    TranslatePipe,
    CodeComponent,
    PropertyFormatComponent,
    PropertyAccessComponent,
    PropertyUnitComponent,
    NzFlexDirective,
    PropertyConstraintComponent,
    PropertyRangeComponent,
    PropertyListComponent,
    PropertyDefMembersComponent,
    UuidComponent,
    LifecycleComponent,
  ],
})
export class SpecPropertyCreateComponent implements OnInit {

  protected readonly ConstraintType = ConstraintType;
  loading: boolean = false;

  form: FormGroup<{
    uuid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    access: FormControl<Access>,
    format: FormControl<DataFormat>,
    constraint: FormControl<ConstraintType>,
    range: FormControl<RangeValue>,
    list: FormControl<ValueItem[]>;
    unit: FormControl<string>,
    members: FormControl<PropertyDefinition[]>,
    lifecycle: FormControl<LifeCycle>,
  }>;

  combinationValue: boolean = false;
  constrainable: boolean = false;

  constructor(
    private router: Router,
    protected account: AccountService,
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private msg: NzMessageService,
    private service: MainService,
  ) {
    this.form = this.fb.group({
      code: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9-]*$/)
      ]),
      uuid: this.fb.control(0, [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      access: this.fb.control(new Access(), [Validators.required]),
      format: this.fb.control(DataFormat.STRING, [Validators.required]),
      constraint: this.fb.control(ConstraintType.NONE, [Validators.required]),
      range: this.fb.control(new RangeValue()),
      list: this.fb.control<ValueItem[]>([]),
      unit: this.fb.control('', [Validators.required]),
      members: this.fb.control<PropertyDefinition[]>([]),
      lifecycle: this.fb.control(LifeCycle.DEVELOPMENT, [Validators.required]),
    });

    // this.form.controls.members.disable();
  }

  ngOnInit() {
  }

  protected onBack() {
    this.router.navigate(['/main/spec']).then(() => {
    });
  }

  protected onFormatChanged() {
    this.constrainable = this.toConstrainable(this.form.controls.format.value);

    switch (this.form.controls.constraint.value) {
      case ConstraintType.NONE:
        break;

      case ConstraintType.RANGE:
        const min = 0;
        const max = 0;
        const step = 0;
        this.form.controls.range.setValue({min: min, max: max, step: step});
        break;

      case ConstraintType.LIST:
        this.form.controls.list.setValue([]);
        break;
    }

    this.combinationValue = this.form.controls.format.value === DataFormat.COMBINATION;
    // if (this.combinationValue) {
    //   console.log('init combinationValue');
    //   this.form.controls.members.setValue(this.property.members);
    //   console.log('init combinationValue ok');
    // }

    // if (this.form.controls.format.value.formatNumber()) {
    //   this.form.controls.unit.setValue(this.property.unit || '');
    // }
  }

  protected submitForm() {
    const value = this.form.value.uuid || 0;
    const uuid = value.toString(16).padStart(8, '0');
    const code = this.form.value.code || 'null';
    const description = new Map<string, string>();
    description.set('en-US', this.form.value.description?.get('en-US') || 'null');
    description.set('zh-CN', this.form.value.description?.get('zh-CN') || 'null');
    const lifecycle = this.form.value.lifecycle || LifeCycle.DEVELOPMENT;

    const type: PropertyType = PropertyType.create(this.account.ns.namespace, UrnType.PROPERTY, code, uuid);
    const def: PropertyDefinition = new PropertyDefinition(type, description);
    def.format = this.form.value.format || DataFormat.STRING;
    def.access = this.form.value.access || new Access();
    def.lifecycle = lifecycle;

    switch (this.form.controls.constraint.value) {
      case ConstraintType.NONE:
        break;

      case ConstraintType.RANGE:
        const range = [this.form.controls.range.value.min, this.form.controls.range.value.max, this.form.controls.range.value.step];
        def.constraintValue = new ValueRange(def.format, range);
        break;

      case ConstraintType.LIST:
        const list = new ValueList();

        for (let item of this.form.controls.list.value) {
          const value = new ValueDefinition(def.format, item.value || 0, item.desc);
          list.values.push(value);
        }

        def.constraintValue = list;
        break;
    }

    if (this.combinationValue) {
      def.members = this.form.controls.members.value.map(x => x.type);
    }

    this.loading = true;
    this.service.createPropertyDefinition(def)
      .subscribe({
        next: () => {
          console.log('createPropertyDefinition ok');
          this.loading = false;
          this.router.navigate(['/main/spec']).then(() => {
          });
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
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
}
