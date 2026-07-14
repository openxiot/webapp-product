import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
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
import {LifeCycle, ProductBasic, ProductFirmwareInstance, ProductPanel, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../../service/main.service';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {DatePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-panel-list',
  standalone: true,
  templateUrl: './product.panel.list.component.html',
  styleUrl: './product.panel.list.component.less',
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
})
export class ProductPanelListComponent implements OnInit, OnChanges {

  protected readonly LifeCycle = LifeCycle;

  @Input() product: ProductBasic = new ProductBasic('', '', '', Urn.create('xiot-spec', UrnType.DEVICE, 'switch', '00000000'), '');

  loading: boolean = false;
  panels: ProductPanel[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
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
    this.loading = true;
    this.service.getProductPanels(productId).subscribe({
      next: data => {
        this.panels = data;
        this.loading = false;
      },
      error: error => {
        this.msg.warning(error);
      }
    })
  }

  refresh() {
    console.log('refresh');
    this.loadPanels(this.product.id);
  }

  protected onView(p: ProductPanel) {
    this.router.navigate([`/main/product/detail/${this.product.id}/panel`]).then(() => {});
  }

  protected onPreview(p: ProductPanel) {
    this.loading = true;
    this.service.setProductPanelLifecycle(this.product.id, p.category, p.version.code, LifeCycle.PREVIEW)
      .subscribe({
        next: () => {
          console.log('setProductPanelLifecycle ok');
          this.loading = false;
          this.loadPanels(this.product.id);
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }

  protected onCancelPreview(p: ProductPanel) {
    this.loading = true;
    this.service.setProductPanelLifecycle(this.product.id, p.category, p.version.code, LifeCycle.DEVELOPMENT)
      .subscribe({
        next: () => {
          console.log('setProductPanelLifecycle ok');
          this.loading = false;
          this.loadPanels(this.product.id);
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }

  protected onDevelopment(p: ProductPanel) {
    this.loading = true;
    this.service.setProductPanelLifecycle(this.product.id, p.category, p.version.code, LifeCycle.DEVELOPMENT)
      .subscribe({
        next: () => {
          console.log('setProductPanelLifecycle ok');
          this.loading = false;
          this.loadPanels(this.product.id);
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }

  protected onDelete(p: ProductPanel) {
    this.loading = true;
    this.service.deleteProductPanel(this.product.id, p.category, p.version.code)
      .subscribe({
        next: () => {
          console.log('deleteProductPanel ok');
          this.loading = false;
          this.loadPanels(this.product.id);
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }
}
