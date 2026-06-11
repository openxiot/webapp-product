import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {ToolbarComponent} from '../../../../../components/toolbar/toolbar.component';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ProductWizardStepComponent} from './step/product.wizard.step.component';
import {LifeCycle, Product, ProductWizard, ProductWizardStep, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {MainService} from '../../../../../service/main.service';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTagComponent} from 'ng-zorro-antd/tag';

@Component({
  selector: 'product-wizard',
  standalone: true,
  templateUrl: './product.wizard.component.html',
  styleUrls: ['./product.wizard.component.less'],
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
    ProductWizardStepComponent,
    NzSpaceModule,
    NzTagComponent
  ],
})
export class ProductWizardComponent implements OnChanges {

  @Input() product: Product = new Product(0, '', '', Urn.create('joy-spec', UrnType.DEVICE, 'switch', '00000000'), '', '');

  protected readonly LifeCycle = LifeCycle;

  loading: boolean = false;
  wizard: ProductWizard = new ProductWizard();
  changed: boolean = false;
  index = 0;

  constructor(
    private msg: NzMessageService,
    private service: MainService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.loadWizard(this.product.id);
    }
  }

  private loadWizard(productId: number) {
    this.loading = true;
    this.service.getProductWizard(productId).subscribe({
      next: data => {
        this.wizard = data;
        this.wizard.steps.sort((a, b) => a.index - b.index);
        this.index = this.wizard.steps.length - 1;
        this.loading = false;
        this.changed = false;
      },
      error: error => {
        this.msg.warning('Failed to getProductWizard', error);
      }
    });
  }

  protected add() {
    this.index++;
    this.wizard.steps.push(new ProductWizardStep(this.index));
    this.changed = true;
  }

  protected onRemoved(step: ProductWizardStep) {
    console.log('onRemoved: ', step.index);

    const removeIndex = this.wizard.steps.indexOf(step);
    if (removeIndex > -1) {
      this.wizard.steps.splice(removeIndex, 1);

      this.index = 0;
      for (let x of this.wizard.steps) {
        this.index++;
        x.index = this.index;
      }

      this.changed = true;
    }
  }

  protected onChanged(step: ProductWizardStep) {
    console.log('onChanged: ', step.index);
    this.changed = true;
  }

  protected onCancel() {
    this.loadWizard(this.product.id);
  }

  protected onSave() {
    this.loading = true;
    this.service.updateProductWizard(this.product.id, this.wizard)
      .subscribe({
        next: () => {
          console.log('updateProductWizard ok');
          this.loading = false;
          this.changed = false;
        },
        error: error => {
          this.msg.warning('Failed to updateProductWizard', error);
          this.loading = false;
          this.loadWizard(this.product.id);
        }
      });
  }

  protected onPreview() {
    this.loading = true;
    this.service.setProductWizardLifecycle(this.product.id, LifeCycle.PREVIEW)
      .subscribe({
        next: () => {
          console.log('setProductWizardLifecycle ok');
          this.wizard.lifecycle = LifeCycle.PREVIEW;
          this.loading = false;
        },
        error: error => {
          this.msg.warning('Failed to setProductWizardLifecycle', error);
          this.loading = false;
        }
      });
  }

  protected cancelPreview() {
    this.loading = true;
    this.service.setProductWizardLifecycle(this.product.id, LifeCycle.DEVELOPMENT)
      .subscribe({
        next: () => {
          console.log('setProductWizardLifecycle ok');
          this.wizard.lifecycle = LifeCycle.DEVELOPMENT;
          this.loading = false;
        },
        error: error => {
          this.msg.warning('Failed to setProductWizardLifecycle', error);
          this.loading = false;
        }
      });
  }
}
