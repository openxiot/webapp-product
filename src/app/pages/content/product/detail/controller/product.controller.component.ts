import {Component, ViewChild, Input, OnChanges, SimpleChanges, signal, ViewContainerRef} from '@angular/core';
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
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {ToolbarComponent} from '../../../../../components/toolbar/toolbar.component';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {
  GenericVersion,
  LifeCycle,
  ProductBasic,
  ProductController,
  ProductInstance,
  Urn,
  UrnType
} from '@openxiot/xiot-core-spec-ts';
import {ProductControllerListComponent} from './list/product.controller.list.component';
import {MainService} from '../../../../../service/main.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ProductControllerCreateComponent} from './create/product.controller.create.component';
import {
  ProductControllerCreateData,
  ProductControllerCreateInput
} from './create/ProductControllerCreate';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-controller',
  standalone: true,
  templateUrl: './product.controller.component.html',
  styleUrl: './product.controller.component.less',
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
    ProductControllerListComponent,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class ProductControllerComponent implements OnChanges {

  @Input() product: ProductBasic = new ProductBasic('', '', '', Urn.create('xiot-spec', UrnType.DEVICE, 'switch', '00000000'), '');

  @ViewChild('ProductController') ProductController!: ProductControllerListComponent;

  loadingInstances = signal(false);
  instances: ProductInstance[] = [];

  loading = signal(false);

  constructor(
    private viewContainerRef: ViewContainerRef,
    private modal: NzModalService,
    private msg: NzMessageService,
    private service: MainService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.loadInstances(this.product.id);
    }
  }

  private loadInstances(productId: string) {
    this.loadingInstances.set(true);
    this.service.getProductInstances(productId).subscribe({
      next: data => {
        // 同一功能版本可能对应多个生命周期状态，按 urn 去重，只保留一个
        const map = new Map<string, ProductInstance>();
        data.forEach(x => {
          if (x.type) {
            map.set(x.type.toString(), x);
          }
        });
        this.instances = [...map.values()].sort((a, b) => (b.type?.version || 0) - (a.type?.version || 0));
        this.loadingInstances.set(false);
      },
      error: error => {
        this.msg.warning(error);
        this.loadingInstances.set(false);
      }
    });
  }

  // 打开“上传控制页”弹窗
  protected onCreate() {
    const modal = this.modal.create<ProductControllerCreateComponent, ProductControllerCreateInput, ProductControllerCreateData>({
      nzTitle: '上传控制页',
      nzWidth: 600,
      nzContent: ProductControllerCreateComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new ProductControllerCreateInput(this.instances, this.ProductController.controllers()),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '确认',
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.create(result);
      }
    });
  }

  // 组装 ProductController 并提交创建
  private create(data: ProductControllerCreateData) {
    const controller = new ProductController(
      LifeCycle.DEVELOPMENT,
      data.category,
      'web',
      data.web,
      new GenericVersion(data.versionName, data.versionCode),
      data.instance,
    );

    this.loading.set(true);
    this.service.createProductController(controller).subscribe({
      next: () => {
        this.msg.success('上传控制页成功');
        this.loading.set(false);
        this.ProductController.refresh();
      },
      error: error => {
        this.msg.warning(error);
        this.loading.set(false);
      }
    });
  }
}