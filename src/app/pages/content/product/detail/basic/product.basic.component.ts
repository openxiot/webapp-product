import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {ActivatedRoute} from '@angular/router';
import {NzCascaderModule} from 'ng-zorro-antd/cascader';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {Subject, takeUntil} from 'rxjs';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {DeviceInstance, LifeCycle, ProductBasic, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {ToolbarComponent} from '../../../../../components/toolbar/toolbar.component';
import {ProductBasicModelComponent} from './model/product.basic.model.component';
import {ProductBasicIdComponent} from './id/product.basic.id.component';
import {ProductBasicTypeComponent} from './type/product.basic.type.component';
import {ProductBasicIconComponent} from './icon/product.basic.icon.component';
import {ProductBasicUpgradeComponent} from './upgrade/product.basic.upgrade.component';
import {UpgradeType} from './upgrade/UpgradeType';
import {ProductBasicProtocolComponent} from './protocol/product.basic.protocol.component';
import {MainService} from '../../../../../service/main.service';
import {ProtocolFromArray, ProtocolToArray} from './protocol/ProtocolType';
import {ProductBasicNameComponent} from './name/product.basic.name.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-basic',
  standalone: true,
  templateUrl: './product.basic.component.html',
  styleUrls: ['./product.basic.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    FormsModule,
    NzRowDirective,
    NzColDirective,
    NzCardModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzCascaderModule,
    NzSwitchModule,
    NzSpaceModule,
    NzTagModule,
    ToolbarComponent,
    ProductBasicModelComponent,
    ProductBasicIdComponent,
    ProductBasicTypeComponent,
    ProductBasicIconComponent,
    ProductBasicUpgradeComponent,
    ProductBasicProtocolComponent,
    ProductBasicNameComponent,
    TranslatePipe,
  ],
})
export class ProductBasicComponent implements OnInit, OnDestroy, OnChanges {

  @Input() product: ProductBasic = new ProductBasic(0, '', '', Urn.create('joy-spec', UrnType.DEVICE, 'switch', '00000000'), '', '');
  @Output() onSaved = new EventEmitter<void>();

  loading: boolean = false;
  values: string[] | null = null;

  private destroy$ = new Subject<void>();

  form: FormGroup<{
    id: FormControl<number>,
    name: FormControl<string>,
    model: FormControl<string>,
    type: FormControl<string>,
    icon: FormControl<string>,
    protocol: FormControl<string[]>,
    upgrade: FormControl<UpgradeType>
  }>;

  changed: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private msg: NzMessageService,
    private service: MainService,
  ) {
    this.form = this.fb.group({
      id: this.fb.control(0, [Validators.required]),
      name: this.fb.control('', [Validators.required]),
      model: this.fb.control('', [Validators.required]),
      type: this.fb.control('', [Validators.required]),
      icon: this.fb.control(''),
      protocol: this.fb.control(['Directly', 'wifi']),
      upgrade: this.fb.control(new UpgradeType())
    });
  }

  ngOnInit() {
    // 监听整个表单的值变化
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        this.changed = this.checkChanged(values);
      });
  }

  private checkChanged(values: Partial<any>): boolean {
    if (this.form.controls.name.value !== this.product.name) {
      return true;
    }

    if (this.form.controls.icon.value !== this.product.icon) {
      return true;
    }

    const newProtocol = ProtocolFromArray(this.form.controls.protocol.value)
    if (newProtocol !== this.product.protocol) {
      return true;
    }

    const upgrade = UpgradeType.of(this.product.upgrade);
    const newUpgrade = this.form.controls.upgrade.value;
    if (! upgrade.equals(newUpgrade)) {
      return true;
    }

    return false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.reset();
    }
  }

  protected onCancel() {
    this.reset();
  }

  private getChangedFields(): Map<string, any> {
    let fields: Map<string, any> = new Map<string, any>();

    if (this.form.controls.name.value !== this.product.name) {
      fields.set('name', this.form.controls.name.value);
    }

    if (this.form.controls.icon.value !== this.product.icon) {
      fields.set('icon', this.form.controls.icon.value);
    }

    const newProtocol = ProtocolFromArray(this.form.controls.protocol.value)
    if (newProtocol !== this.product.protocol) {
      fields.set('protocol', newProtocol);
    }

    const upgrade = UpgradeType.of(this.product.upgrade);
    const newUpgrade = this.form.controls.upgrade.value;
    if (! upgrade.equals(newUpgrade)) {
      fields.set('upgrade', newUpgrade.toArray());
    }

    return fields;
  }

  protected onSave() {
    this.loading = true;
    this.service.updateProduct(this.product, this.getChangedFields())
      .subscribe({
        next: () => {
          console.log('updateProduct ok');
          this.loading = false;
          this.changed = false;
          this.onSaved.emit();
        },
        error: error => {
          this.msg.warning('Failed to updateProduct', error);
          this.loading = false;
          this.reset();
        }
      });
  }

  protected onRemove() {

  }

  protected onPreview() {
    this.loading = true;
    this.service.setProductLifecycle(this.product.id, LifeCycle.PREVIEW)
      .subscribe({
        next: () => {
          console.log('setProductLifecycle ok');
          this.product.lifecycle = LifeCycle.PREVIEW;
          this.loading = false;
        },
        error: error => {
          this.msg.warning('Failed to setProductLifecycle', error);
          this.loading = false;
          this.reset();
        }
      });
  }

  protected cancelPreview() {
    this.loading = true;
    this.service.setProductLifecycle(this.product.id, LifeCycle.DEVELOPMENT)
      .subscribe({
        next: () => {
          console.log('setProductLifecycle ok');
          this.product.lifecycle = LifeCycle.DEVELOPMENT;
          this.loading = false;
        },
        error: error => {
          this.msg.warning('Failed to setProductLifecycle', error);
          this.loading = false;
          this.reset();
        }
      });
  }

  private reset() {
    this.form.controls.id.setValue(this.product.id);
    this.form.controls.name.setValue(this.product.name);
    this.form.controls.model.setValue(this.product.model);
    this.form.controls.type.setValue(this.product.template.name);
    this.form.controls.icon.setValue(this.product.icon);
    this.form.controls.protocol.setValue(ProtocolToArray(this.product.protocol));
    this.form.controls.upgrade.setValue(UpgradeType.of(this.product.upgrade));
    this.changed = false;
  }

  protected readonly LifeCycle = LifeCycle;
}
