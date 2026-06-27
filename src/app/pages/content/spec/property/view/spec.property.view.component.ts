import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {BreadcrumbTranslateDirective} from '../../../../../common/component/breadcrumb/breadcrumb-translate.directive';
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
  DataFormat,
  FormatDefinition,
  LifeCycle,
  PropertyDefinition,
  UnitDefinition
} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {DescriptionComponent} from '../../../../../common/form/item/common/description/description.component';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {SpecCodeComponent} from '../../../../../common/form/item/common/code/spec.code.component';
import {PropertyFormatComponent} from '../../../../../common/form/item/property/common/format/property.format.component';
import {PropertyAccessComponent} from '../../../../../common/form/item/property/common/access/property.access.component';
import {PropertyDefinitionUnitComponent} from '../../../../../common/form/item/property/def/unit/property.definition.unit.component';
import {RangeValue} from '../../../../../common/form/item/property/common/range/RangeValue';
import {ValueItem} from '../../../../../common/form/item/property/common/list/ValueItem';
import {ConstraintType} from '../../../../../common/form/item/property/common/constraint/ConstraintType';
import {
  PropertyConstraintComponent
} from '../../../../../common/form/item/property/common/constraint/property.constraint.component';
import {PropertyRangeComponent} from '../../../../../common/form/item/property/common/range/property.range.component';
import {PropertyListComponent} from '../../../../../common/form/item/property/common/list/property.list.component';
import {
  PropertyDefinitionMembersComponent
} from '../../../../../common/form/item/property/def/members/property.definition.members.component';
import {UuidComponent} from '../../../../../common/form/item/common/uuid/uuid.component';
import {LifecycleComponent} from '../../../../../common/form/item/common/lifecycle/lifecycle.component';
import {Location} from '@angular/common';

@Component({
  selector: 'spec-property-view',
  standalone: true,
  templateUrl: './spec.property.view.component.html',
  styleUrls: ['./spec.property.view.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    BreadcrumbTranslateDirective,
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
    SpecCodeComponent,
    PropertyFormatComponent,
    PropertyAccessComponent,
    PropertyDefinitionUnitComponent,
    PropertyConstraintComponent,
    PropertyRangeComponent,
    PropertyListComponent,
    PropertyDefinitionMembersComponent,
    UuidComponent,
    LifecycleComponent,
  ],
})
export class SpecPropertyViewComponent implements OnInit {

  protected readonly ConstraintType = ConstraintType;

  loading: boolean = false;
  propertyType: string = '';
  properties: PropertyDefinition[] = [];
  propertyMap: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingFormats: boolean = false;
  formats: FormatDefinition[] = [];

  loadingUnits: boolean = false;
  units: UnitDefinition[] = [];

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
    protected location: Location,
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
        Validators.pattern(/^[a-z][a-z0-9-]*$/)
      ]),
      uuid: this.fb.control(0, [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      access: this.fb.control(new Access(), [Validators.required]),
      format: this.fb.control(DataFormat.STRING, [Validators.required]),
      constraint: this.fb.control(ConstraintType.NONE, [Validators.required]),
      range: this.fb.control(new RangeValue()),
      list: this.fb.control<ValueItem[]>([]),
      unit: this.fb.control(''),
      members: this.fb.control<PropertyDefinition[]>([]),
      lifecycle: this.fb.control(LifeCycle.DEVELOPMENT, [Validators.required]),
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.propertyType = params['type'] || '';
      this.loadPropertyDefinitions();
    });

    this.loadFormats();
    this.loadUnits();
  }

  private loadUnits(): void {
    this.loadingUnits = true;
    this.service.getUnitDefinitions(this.account.ns.namespace)
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

  private loadPropertyDefinitions(): void {
    this.loading = true;
    this.service.getPropertyDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.properties = data;
          this.propertyMap = new Map(data.map(item => [item.type.name, item]));
          this.loading = false;
          this.load(this.propertyType);
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  private loadFormats(): void {
    this.loadingFormats = true;
    this.service.getFormatDefinitions(this.account.ns.namespace)
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

  private load(type: string) {
    this.loading = true;

    this.service.getPropertyDefinition(type)
      .subscribe({
        next: (p) => {
          console.log('getPropertyDefinition ok');

          this.form.controls.code.setValue(p.type.name);
          this.form.controls.uuid.setValue(p.type.value);
          this.form.controls.description.setValue(p.description);
          this.form.controls.lifecycle.setValue(p.lifecycle);

          this.form.controls.format.setValue(p.format);
          this.form.controls.access.setValue(p.access);
          this.form.controls.constraint.setValue(this.getConstrainType(p));
          this.constrainable = this.toConstrainable(p.format);

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

            let members: PropertyDefinition[] = [];
            for (let member of p.members) {
              const x = this.propertyMap.get(member.name);
              if (x) {
                members.push(x);
              }
            }

            this.form.controls.members.setValue(members);
            console.log('init combinationValue ok');
          }

          if (p.formatNumber()) {
            this.form.controls.unit.setValue(p.unit || '');
          }

          // ValueList渲染完成，需要时间，如果loading已经是true，则onConstraintListChanged会传到到最上层。
          setTimeout(() => { this.loading = false;}, 100);
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }

  private getConstrainType(p: PropertyDefinition): ConstraintType {
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
