import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {ToolbarComponent} from '../../../../../components/toolbar/toolbar.component';
import {ProductBasic, LifeCycle, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzOptionComponent, NzSelectModule} from 'ng-zorro-antd/select';
import {FormsModule} from '@angular/forms';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzMessageService} from 'ng-zorro-antd/message';
import {MainService} from '../../../../../service/main.service';

@Component({
  selector: 'product-visibility',
  standalone: true,
  templateUrl: './product.visibility.component.html',
  styleUrls: ['./product.visibility.component.less'],
  imports: [
    FormsModule,
    NzCardModule,
    NzButtonComponent,
    NzColDirective,
    NzRowDirective,
    NzWaveDirective,
    NzTagComponent,
    NzOptionComponent,
    NzSelectModule,
    NzSpaceModule,
    NzTableModule,
    ToolbarComponent
  ],
})
export class ProductVisibilityComponent implements OnChanges {

  @Input() product: ProductBasic = new ProductBasic(0, '', '', Urn.create('joy-spec', UrnType.DEVICE, 'switch', '00000000'), '', '');

  protected readonly LifeCycle = LifeCycle;

  loading: boolean = false;
  changed: boolean = false;

  constructor(
    private msg: NzMessageService,
    private service: MainService
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.loadVisibility(this.product.id);
    }
  }

  private loadVisibility(productId: number) {
    // this.loading = true;
    // this.service.getProductVisibility(productId).subscribe({
    //   next: data => {
    //     this.visibility = data;
    //     this.loading = false;
    //     this.changed = false;
    //   },
    //   error: error => {
    //     this.msg.warning('Failed to getProductVisibility', error);
    //   }
    // });
  }

  protected onCurrentTypeChanged($event: any) {

  }

  protected onPreview() {

  }

  protected onCancelPreview() {

  }

  protected onCancel() {

  }

  protected onSave() {

  }

  protected onAddApp() {

  }

  // protected onRemoveApp(app: ProductVisibilityApplication) {
  //
  // }
}
