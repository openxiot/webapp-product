import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {ReactiveFormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {ActivatedRoute, Router} from '@angular/router';
import {ProductBasicComponent} from './basic/product.basic.component';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {ProductWizardComponent} from './wizard/product.wizard.component';
import {ProductFirmwareComponent} from './firmware/product.firmware.component';
import {ProductManualComponent} from './manual/product.manual.component';
import {ObjectWithLifecycle, DeviceInstance, Product, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../service/main.service';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {ProductPanelComponent} from './panel/product.panel.component';
import {ProductInstanceComponent} from './instance/product.instance.component';
import {ProductVisibilityComponent} from './visibility/product.visibility.component';

@Component({
  selector: 'product-detail',
  standalone: true,
  templateUrl: './product.detail.component.html',
  styleUrls: ['./product.detail.component.less'],
  imports: [
    ReactiveFormsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzButtonModule,
    NzCheckboxModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzSpaceModule,
    ProductBasicComponent,
    ProductWizardComponent,
    ProductFirmwareComponent,
    ProductManualComponent,
    NzTagModule,
    ProductInstanceComponent,
    ProductPanelComponent,
    ProductVisibilityComponent,
  ],
})
export class ProductDetailComponent implements OnInit {

  tabIndex: number = 0;

  loading: boolean = true;
  productId: number = 0;
  product: Product = new Product(0, '', '', Urn.create('joy-spec', UrnType.DEVICE, 'switch', '00000000'), '', '');
  instances: ObjectWithLifecycle<DeviceInstance>[] = [];

  constructor(
    private route: ActivatedRoute,
    private msg: NzMessageService,
    private router: Router,
    private service: MainService,
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = params['productId'];
      this.load(this.productId);
    });
  }

  private load(productId: number): void {
    this.loading = true;
    this.service.getProduct(productId).subscribe({
      next: data => {
        this.product = data;
        this.loading = false;
      },
      error: error => {
        this.msg.warning('Failed to getProduct', error);
      }
    });
  }

  protected onBack() {
    this.router.navigate(['/main/product']).then(() => {});
  }

  protected onSaved() {
    this.load(this.productId);
  }
}
