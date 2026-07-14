import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ToolbarComponent} from '../../../../../components/toolbar/toolbar.component';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {LifeCycle, ProductBasic, ProductManual, ProductManualPage, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {ProductManualPageComponent} from './page/product.manual.page.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-manual',
  standalone: true,
  templateUrl: './product.manual.component.html',
  styleUrl: './product.manual.component.less',
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    FormsModule,
    NzCardModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    ToolbarComponent,
    NzIconModule,
    NzSpaceModule,
    NzTagComponent,
    ProductManualPageComponent,
    TranslatePipe
  ],
})
export class ProductManualComponent implements OnChanges {

  @Input() product: ProductBasic = new ProductBasic('', '', '', Urn.create('', UrnType.DEVICE, 'switch', '00000000'), '');

  protected readonly LifeCycle = LifeCycle;

  loading: boolean = false;
  manual: ProductManual = new ProductManual();
  changed: boolean = false;
  index = 0;

  constructor(
    private msg: NzMessageService,
    private service: MainService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.loadManual(this.product.id);
    }
  }

  private loadManual(productId: string) {
    this.loading = true;
    this.service.getProductManual(productId).subscribe({
      next: data => {
        this.manual = data;
        this.manual.pages.sort((a, b) => a.index - b.index);
        this.index = this.manual.pages.length - 1;
        this.loading = false;
        this.changed = false;
      },
      error: error => {
        this.msg.warning(error);
      }
    });
  }

  protected add() {
    this.index++;
    this.manual.pages.push(new ProductManualPage(this.index));
    this.changed = true;
  }

  protected onRemoved(step: ProductManualPage) {
    console.log('onRemoved: ', step.index);

    const removeIndex = this.manual.pages.indexOf(step);
    if (removeIndex > -1) {
      this.manual.pages.splice(removeIndex, 1);

      this.index = 0;
      for (let x of this.manual.pages) {
        this.index++;
        x.index = this.index;
      }

      this.changed = true;
    }
  }

  protected onChanged(step: ProductManualPage) {
    console.log('onChanged: ', step.index);
    this.changed = true;
  }

  protected onCancel() {
    this.loadManual(this.product.id);
  }

  protected onSave() {
    this.loading = true;
    this.service.updateProductManual(this.product.id, this.manual)
      .subscribe({
        next: () => {
          console.log('updateProductManual ok');
          this.loading = false;
          this.changed = false;
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
          this.loadManual(this.product.id);
        }
      });
  }

  protected onPreview() {
    this.loading = true;
    this.service.setProductManualLifecycle(this.product.id, LifeCycle.PREVIEW)
      .subscribe({
        next: () => {
          console.log('setProductManualLifecycle ok');
          this.manual.lifecycle = LifeCycle.PREVIEW;
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }

  protected cancelPreview() {
    this.loading = true;
    this.service.setProductManualLifecycle(this.product.id, LifeCycle.DEVELOPMENT)
      .subscribe({
        next: () => {
          console.log('setProductManualLifecycle ok');
          this.manual.lifecycle = LifeCycle.DEVELOPMENT;
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }
}
