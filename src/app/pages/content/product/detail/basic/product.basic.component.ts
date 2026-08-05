import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewContainerRef,
  signal
} from '@angular/core';
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
import {LifeCycle, LocalizedName, ProductBasic, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {ToolbarComponent} from '../../../../../components/toolbar/toolbar.component';
import {ProductBasicIdComponent} from './id/product.basic.id.component';
import {ProductIconComponent} from '../../create/icon/product.icon.component';
import {ProductBasicUpgradeComponent} from './upgrade/product.basic.upgrade.component';
import {UpgradeType} from './upgrade/UpgradeType';
import {ProductBasicProtocolComponent} from '../../create/protocol/product.basic.protocol.component';
import {MainService} from '../../../../../service/main.service';
import {ProtocolFromArray, ProtocolToArray} from '../../create/protocol/ProtocolType';
import {TranslatePipe} from '@ngx-translate/core';
import {ProductNameComponent} from '../../create/name/product.name.component';
import {AccountService} from '../../../../../service/account.service';
import {Location} from '@angular/common';
import {ConfirmComponent} from '../../../../../common/dialog/confirm/confirm.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {MainI18nService} from '../../../../../service/i18n.service';
import {ProductAliasComponent} from '../../create/alias/product.alias.component';
import {ProductTemplateComponent} from '../../create/template/product.template.component';
import {SpecModelComponent} from '../../../../../common/form/item/common/model/spec.model.component';

@Component({
  selector: 'product-basic',
  standalone: true,
  templateUrl: './product.basic.component.html',
  styleUrl: './product.basic.component.less',
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
    ProductBasicIdComponent,
    ProductIconComponent,
    ProductBasicUpgradeComponent,
    ProductBasicProtocolComponent,
    TranslatePipe,
    ProductNameComponent,
    ProductAliasComponent,
    ProductTemplateComponent,
    SpecModelComponent,
  ],
  providers: [
    NzModalService
  ],
})
export class ProductBasicComponent implements OnInit, OnDestroy, OnChanges {

  @Input() product: ProductBasic = new ProductBasic('', '', '', Urn.create('', UrnType.DEVICE, 'switch', '00000000'), '');
  @Output() onSaved = new EventEmitter<void>();

  loading = signal(false);
  values: string[] | null = null;

  private destroy$ = new Subject<void>();

  form: FormGroup<{
    id: FormControl<string>,
    name: FormControl<LocalizedName>,
    alias: FormControl<LocalizedName[]>,
    model: FormControl<string>,
    template: FormControl<Urn>,
    icon: FormControl<string>,
    protocol: FormControl<string[]>,
    upgrade: FormControl<UpgradeType>
  }>;

  editable = signal(false);
  manageable = signal(false);
  changed = signal(false);

  constructor(
    public i18n: MainI18nService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    protected location: Location,
    protected account: AccountService,
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private msg: NzMessageService,
    private service: MainService,
  ) {
    this.form = this.fb.group({
      id: this.fb.control('', [Validators.required]),
      name: this.fb.control<LocalizedName>(new LocalizedName(), [Validators.required]),
      alias: this.fb.control<LocalizedName[]>([], [Validators.required]),
      model: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-z][a-z0-9-]*$/)
      ]),
      template: this.fb.control<Urn>(Urn.create('', UrnType.DEVICE, '', '0000'), [Validators.required]),
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
        this.changed.set(this.checkChanged(values));
      });
  }

  /**
   * 当前用户的组织是否匹配模板创建者的组织
   * 有组织的前提是已登录
   */
  private isOrgMatch(): boolean {
    if (!this.account.login() || !this.account.organization()?.id || !this.product) {
      return false;
    }
    console.log("this.account.organization().id: " + this.account.organization().id);
    return this.product.organization === this.account.organization().id;
  }

  /**
   * 计算是否可管理（已登录 + 组织匹配）
   */
  private computeManageable(): boolean {
    return this.isOrgMatch();
  }

  /**
   * 计算是否有完整编辑权限（已登录 + 组织匹配 + 开发状态）
   */
  private computeEditable(): boolean {
    if (!this.isOrgMatch()) return false;
    return this.product!.lifecycle === LifeCycle.DEVELOPMENT;
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

  protected onSave() {
    this.product.name = this.form.controls.name.value;
    this.product.alias = this.form.controls.alias.value;
    this.product.icon = this.form.controls.icon.value;
    this.product.protocol = ProtocolFromArray(this.form.controls.protocol.value);
    this.product.upgrade = this.form.controls.upgrade.value.toArray();

    this.loading.set(true);
    this.service.updateProduct(this.product)
      .subscribe({
        next: () => {
          console.log('updateProduct ok');
          this.loading.set(false);
          this.changed.set(false);
          this.onSaved.emit();
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
          this.reset();
        }
      });
  }

  protected onRemove() {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个产品吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.product.name.value.get(this.i18n.getCurrentLang()),
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
        this.doRemove();
      }
    });
  }

  private doRemove() {
    this.loading.set(true);
    this.service.deleteProduct(this.account.organization().id, this.product.id)
      .subscribe({
        next: () => {
          console.log('deleteProduct ok');
          this.loading.set(false);
          this.location.back();
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      });
  }

  protected onPreview() {
    this.doChangeLifecycle(LifeCycle.PREVIEW);
  }

  protected cancelPreview() {
    this.doChangeLifecycle(LifeCycle.DEVELOPMENT);
  }

  protected onRelease() {
    this.doChangeLifecycle(LifeCycle.RELEASED);
  }

  protected onDevelopment() {
    this.doChangeLifecycle(LifeCycle.DEVELOPMENT);
  }

  private doChangeLifecycle(lifecycle: LifeCycle) {
    this.loading.set(true);
    this.service.setProductLifecycle(this.product.id, lifecycle)
      .subscribe({
        next: () => {
          console.log('setProductLifecycle ok');
          this.product.lifecycle = lifecycle;
          this.editable.set(this.computeEditable());
          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
          this.reset();
        }
      });
  }

  private reset() {
    this.form.controls.id.setValue(this.product.id);
    this.form.controls.name.setValue(this.product.name);
    this.form.controls.alias.setValue(this.product.alias);
    this.form.controls.model.setValue(this.product.model);
    this.form.controls.template.setValue(this.product.template);
    this.form.controls.icon.setValue(this.product.icon);
    this.form.controls.protocol.setValue(ProtocolToArray(this.product.protocol));
    this.form.controls.upgrade.setValue(UpgradeType.of(this.product.upgrade));

    this.manageable.set(this.computeManageable());
    this.editable.set(this.computeEditable());
    this.changed.set(false);
  }

  protected readonly LifeCycle = LifeCycle;
}
