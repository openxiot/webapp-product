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
import {ProductBasicIconComponent} from '../detail/basic/icon/product.basic.icon.component';
import {LocalizedName, ProductBasic, ProductBasicCodec, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {ProductBasicProtocolComponent} from '../detail/basic/protocol/product.basic.protocol.component';
import {ProductBasicUpgradeComponent} from '../detail/basic/upgrade/product.basic.upgrade.component';
import {UpgradeType} from '../detail/basic/upgrade/UpgradeType';
import {MainService} from '../../../../service/main.service';
import {ProtocolFromArray} from '../detail/basic/protocol/ProtocolType';
import {Location} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {ProductNameComponent} from './name/product.name.component';
import {SpecModelComponent} from '../../../../common/form/item/common/model/spec.model.component';
import {ProductAliasComponent} from './alias/product.alias.component';
import {ProductTemplateComponent} from './template/product.template.component';
import {BreadcrumbTranslateDirective} from '../../../../common/component/breadcrumb/breadcrumb-translate.directive';
import {AccountService} from '../../../../service/account.service';

@Component({
  selector: 'product-create',
  standalone: true,
  templateUrl: './product.create.component.html',
  styleUrls: ['./product.create.component.less'],
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
    ProductBasicIconComponent,
    ProductBasicProtocolComponent,
    ProductBasicUpgradeComponent,
    TranslatePipe,
    ProductNameComponent,
    SpecModelComponent,
    ProductAliasComponent,
    ProductTemplateComponent,
    BreadcrumbTranslateDirective
  ],
})
export class ProductCreateComponent implements OnInit {

  product: ProductBasic = new ProductBasic("", '', '', Urn.create('', UrnType.DEVICE, 'switch', '00000000'), '');
  loading: boolean = false;

  form: FormGroup<{
    name: FormControl<LocalizedName>,
    alias: FormControl<LocalizedName[]>,
    model: FormControl<string>,
    template: FormControl<Urn>,
    icon: FormControl<string>,
    protocol: FormControl<string[]>,
    upgrade: FormControl<UpgradeType>
  }>;

  constructor(
    private account: AccountService,
    protected location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private msg: NzMessageService,
    private service: MainService,
  ) {
    this.form = this.fb.group({
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
  }

  protected submitForm() {
    this.product.organization = this.account.organization.id,
    this.product.name = this.form.controls.name.value;
    this.product.alias = this.form.controls.alias.value;
    this.product.model = this.form.controls.model.value;
    this.product.template = this.form.controls.template.value;
    this.product.icon = this.form.controls.icon.value;
    this.product.protocol = ProtocolFromArray(this.form.controls.protocol.value)
    this.product.upgrade = this.form.controls.upgrade.value.toArray();

    console.log('product: ', this.product);
    console.log('product => ', ProductBasicCodec.encode(this.product));

    this.loading = true;
    this.service.createProduct(this.product)
      .subscribe({
        next: () => {
          console.log('updateProduct ok');
          this.loading = false;
          this.router.navigate(['/main/product']).then(() => {});
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }
}
