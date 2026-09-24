import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewContainerRef, signal} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {ActivatedRoute, Router} from '@angular/router';
import {NzUploadModule} from 'ng-zorro-antd/upload';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTableModule} from 'ng-zorro-antd/table';
import {LifeCycle, ProductBasic, ProductController, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../../service/main.service';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {DatePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ProductControllerEditComponent} from '../edit/product.controller.edit.component';
import {ConfirmComponent} from '../../../../../../common/dialog/confirm/confirm.component';

@Component({
  selector: 'product-controller-list',
  standalone: true,
  templateUrl: './product.controller.list.component.html',
  styleUrl: './product.controller.list.component.less',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzUploadModule,
    NzIconModule,
    NzTableModule,
    NzTagModule,
    NzDividerComponent,
    DatePipe,
    TranslatePipe
  ],
  providers: [
    NzModalService
  ],
})
export class ProductControllerListComponent implements OnInit, OnChanges {

  protected readonly LifeCycle = LifeCycle;

  @Input() product: ProductBasic = new ProductBasic('', '', '', Urn.create('xiot-spec', UrnType.DEVICE, 'switch', '00000000'), '');

  loading = signal(false);
  controllers = signal<ProductController[]>([]);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private viewContainerRef: ViewContainerRef,
    private modal: NzModalService,
    private fb: NonNullableFormBuilder,
    private msg: NzMessageService,
    private service: MainService,
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.loadPanels(this.product.id);
    }
  }

  private loadPanels(productId: string) {
    this.loading.set(true);
    this.service.getProductControllers(productId).subscribe({
      next: data => {
        this.controllers.set(data);
        this.loading.set(false);
      },
      error: error => {
        this.msg.warning(error);
        this.loading.set(false);
      }
    })
  }

  refresh() {
    this.loadPanels(this.product.id);
  }

  // 打开/预览控制页
  protected onView(p: ProductController) {
    if (p.web?.url) {
      window.open(p.web.url, '_blank');
    }
  }

  // 编辑（仅 development 允许）
  protected onEdit(p: ProductController) {
    const modal = this.modal.create<ProductControllerEditComponent, ProductController, ProductController>({
      nzTitle: '编辑控制页',
      nzWidth: 600,
      nzContent: ProductControllerEditComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: p,
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
        this.update(result);
      }
    });
  }

  private update(controller: ProductController) {
    this.loading.set(true);
    this.service.updateProductController(controller).subscribe({
      next: () => {
        this.msg.success('编辑成功');
        this.loading.set(false);
        this.loadPanels(this.product.id);
      },
      error: error => {
        this.msg.warning(error);
        this.loading.set(false);
      }
    });
  }

  protected onPreview(p: ProductController) {
    this.loading.set(true);
    this.service.setProductControllerLifecycle(p.instance.toString(), p.category, p.version.code, LifeCycle.PREVIEW)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.loadPanels(this.product.id);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      });
  }

  protected onCancelPreview(p: ProductController) {
    this.loading.set(true);
    this.service.setProductControllerLifecycle(p.instance.toString(), p.category, p.version.code, LifeCycle.DEVELOPMENT)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.loadPanels(this.product.id);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      });
  }

  protected onDevelopment(p: ProductController) {
    this.loading.set(true);
    this.service.setProductControllerLifecycle(p.instance.toString(), p.category, p.version.code, LifeCycle.DEVELOPMENT)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.loadPanels(this.product.id);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      });
  }

  protected onDelete(p: ProductController) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: '您真的要删除这个控制页吗？',
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: `版本名称：${p.version.name}, 版本编码：${p.version.code}`,
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '删除',
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.deleteController(p);
      }
    });
  }

  private deleteController(p: ProductController) {
    this.loading.set(true);
    this.service.deleteProductController(p.instance.toString(), p.category, p.version.code)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.loadPanels(this.product.id);
        },
        error: error => {
          this.msg.warning(error);
          this.loading.set(false);
        }
      });
  }
}