import {Component, OnInit} from '@angular/core';
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
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {ProductWizardStepComponent} from '../wizard/step/product.wizard.step.component';
import {SupplyMaterial} from './SupplyMaterial';
import {ProductSupplyMaterialComponent} from './material/product.supply.material.component';
import {FooterToolbarComponent} from '../../../../../components/footer-toolbar/footer-toolbar.component';
import {ToolbarComponent} from '../../../../../components/toolbar/toolbar.component';
import {NzIconDirective} from 'ng-zorro-antd/icon';

@Component({
  selector: 'product-supply',
  standalone: true,
  templateUrl: './product.supply.component.html',
  styleUrls: ['./product.supply.component.less'],
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
    ProductWizardStepComponent,
    ProductSupplyMaterialComponent,
    FooterToolbarComponent,
    ToolbarComponent,
    NzIconDirective
  ],
})
export class ProductSupplyComponent implements OnInit {

  index = 1;

  materials: SupplyMaterial[] = [
  ];

  constructor(
  ) {

  }

  ngOnInit() {
  }

  protected add() {
    this.index ++;
    this.materials.push(new SupplyMaterial(this.index));
  }
}
