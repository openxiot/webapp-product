import {Component, ViewChild, Input, OnChanges, SimpleChanges} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {ActivatedRoute, Router} from '@angular/router';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {ToolbarComponent} from '../../../../../components/toolbar/toolbar.component';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {ProductBasic, ProductInstance, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {ProductPanelListComponent} from './list/product.panel.list.component';
import {MainService} from '../../../../../service/main.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-panel',
  standalone: true,
  templateUrl: './product.panel.component.html',
  styleUrls: ['./product.panel.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzRowDirective,
    NzColDirective,
    NzCardModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzSwitchModule,
    NzIconDirective,
    ToolbarComponent,
    ProductPanelListComponent,
    TranslatePipe,
  ],
})
export class ProductPanelComponent implements OnChanges {

  @Input() product: ProductBasic = new ProductBasic(0, '', '', Urn.create('xiot-spec', UrnType.DEVICE, 'switch', '00000000'), '', '');

  @ViewChild('productPanel') productPanel!: ProductPanelListComponent;

  loadingInstances: boolean = false;
  instances: ProductInstance[] = [];
  currentVersion: string = '1';

  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private msg: NzMessageService,
    private router: Router,
    private service: MainService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.loadInstances(this.product.id);
    }
  }

  private loadInstances(productId: number) {
    this.loadingInstances = true;
    this.service.getProductInstances(productId).subscribe({
      next: data => {
        this.instances = data;
        this.instances.sort((a, b) => (b.type?.version || 0) - (a.type?.version || 0))
        this.loadingInstances = false;

        if (this.instances.length > 0) {
          this.currentVersion = this.instances[0].type?.version.toString() || '0';
        } else {
          this.msg.warning('没有产品功能定义，请创建产品功能');
        }
      },
      error: error => {
        this.msg.warning('Failed to getProductInstances', error);
      }
    });
  }

  protected create() {
    this.loading = true;

    this.service.createDeviceUI(this.product.id, this.instances[0].type?.toString() || '')
      .then(device => {
        console.log('createDeviceUI: ', device);
        this.productPanel.refresh();
        this.loading = false;
      })
      .catch(error => {
        this.msg.warning('Failed to createDeviceUI', error);
        this.loading = false;
      })
  }
}
