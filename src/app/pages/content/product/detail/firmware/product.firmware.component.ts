import {Component, Input, OnChanges, SimpleChanges, ViewContainerRef} from '@angular/core';
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
import {ActivatedRoute} from '@angular/router';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {ToolbarComponent} from '../../../../../components/toolbar/toolbar.component';
import {
  LifeCycle,
  ProductBasic,
  ProductFirmware,
  ProductFirmwareInstance,
  ProductInstance,
  Urn,
  UrnType
} from '@openxiot/xiot-core-spec-ts';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {FormsModule} from '@angular/forms';
import {MainService} from '../../../../../service/main.service';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CreateFirmwareComponent} from './create/create.firmware.component';
import {EditFirmwareComponent} from './edit/edit.firmware.component';
import {EditFirmwareResult} from './edit/EditFirmwareResult';
import {UploadFirmwareComponent} from './upload/upload.firmware.component';
import {UploadFirmware} from './upload/UploadFirmware';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {ConfirmComponent} from '../../../../../common/dialog/confirm/confirm.component';
import {MainI18nService} from '../../../../../service/i18n.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-firmware',
  standalone: true,
  templateUrl: './product.firmware.component.html',
  styleUrls: ['./product.firmware.component.less'],
  imports: [
    FormsModule,
    NzRowDirective,
    NzColDirective,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzTagModule,
    NzTableModule,
    NzCardModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzSwitchModule,
    NzOptionComponent,
    NzSelectComponent,
    NzDividerModule,
    ToolbarComponent,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class ProductFirmwareComponent implements OnChanges {

  @Input() product: ProductBasic = new ProductBasic(0, '', '', Urn.create('joy-spec', UrnType.DEVICE, 'switch', '00000000'), '', '');

  protected readonly LifeCycle = LifeCycle;

  loadingFirmwares: boolean = false;
  firmwares: ProductFirmware[] = [];
  currentFirmware: string = '';

  loadingFirmwareInstances: boolean = false;
  firmwareInstances: ProductFirmwareInstance[] = [];

  loadingProductInstances: boolean = false;
  productInstances: ProductInstance[] = [];

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private route: ActivatedRoute,
    private service: MainService,
    private msg: NzMessageService,
    public i18n: MainI18nService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.loadFirmwares(this.product.id);
      this.loadProductInstances(this.product.id);
    }
  }

  private loadFirmwares(productId: number) {
    this.loadingFirmwares = true;
    this.service.getProductFirmwares(productId).subscribe({
      next: data => {
        this.firmwares = data;
        if (this.firmwares.length > 0) {
          this.currentFirmware = this.firmwares[0].name;
        }

        this.loadingFirmwares = false;

        this.loadFirmwareInstances(productId, this.currentFirmware);
      },
      error: error => {
        this.msg.warning('Failed to getProductFirmwares', error);
      }
    });
  }

  private loadFirmwareInstances(productId: number, name: string) {
    this.loadingFirmwareInstances = true;
    this.service.getProductFirmwareInstances(productId, name).subscribe({
      next: data => {
        this.firmwareInstances = data;
        this.loadingFirmwareInstances = false;
      },
      error: error => {
        this.msg.warning('Failed to getProductFirmwareInstances', error);
      }
    });
  }

  private loadProductInstances(productId: number) {
    this.loadingProductInstances = true;
    this.service.getProductInstances(productId).subscribe({
      next: data => {
        this.productInstances = data;
        this.loadingProductInstances = false;
      },
      error: error => {
        this.msg.warning('Failed to getProductInstances', error);
      }
    });
  }

  protected onCurrentFirmwareChanged($event: any) {
    this.loadFirmwareInstances(this.product.id, this.currentFirmware);
  }

  protected onUpload() {
    const firmware = this.firmwares.find(x => x.name === this.currentFirmware);
    if (firmware) {
      const modal = this.modal.create<UploadFirmwareComponent, UploadFirmware, ProductFirmwareInstance>({
        nzTitle: '上传固件',
        nzWidth: 600,
        nzContent: UploadFirmwareComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzData: new UploadFirmware(this.product.id, this.productInstances, firmware, this.firmwareInstances),
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
          this.save(firmware, result);
        }
      });
    }
  }

  private save(firmware: ProductFirmware, instance: ProductFirmwareInstance) {
    this.loadingFirmwareInstances = true;
    this.service.createProductFirmwareInstance(this.product.id, firmware.name, instance)
      .subscribe({
        next: () => {
          console.log('createProductFirmwareInstance ok');
          this.loadingFirmwareInstances = false;
          this.loadFirmwareInstances(this.product.id, this.currentFirmware);
        },
        error: error => {
          this.msg.warning('Failed to createProductFirmwareInstance', error);
          this.loadingFirmwareInstances = false;
        }
      });
  }

  protected onEdit() {
    const firmware = this.firmwares.find(x => x.name === this.currentFirmware);
    if (firmware) {
      const modal = this.modal.create<EditFirmwareComponent, ProductFirmware, EditFirmwareResult>({
        nzTitle: '编辑固件',
        nzWidth: 600,
        nzContent: EditFirmwareComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzData: new ProductFirmware(firmware.name, firmware.description, firmware.type),
        nzFooter: [
          {
            label: '删除',
            danger: true,
            type: 'primary',
            onClick: component => component!.delete()
          },
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
          switch (result.operator) {
            case 'delete':
              if (this.firmwareInstances.length > 0) {
                this.msg.warning('固件文件个数不为0，不能删除');
              } else {
                this.delete(result.firmware);
              }
              break;

            case 'cancel':
              break;

            case 'save':
              this.update(result.firmware);
              break;
          }
        }
      });
    }
  }

  protected onCreate() {
    const modal = this.modal.create<CreateFirmwareComponent, string, ProductFirmware>({
      nzTitle: '创建固件',
      nzWidth: 600,
      nzContent: CreateFirmwareComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: '',
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

  private create(firmware: ProductFirmware) {
    this.loadingFirmwares = true;
    this.service.createProductFirmware(this.product.id, firmware)
      .subscribe({
        next: () => {
          console.log('createProductFirmware ok');
          this.loadingFirmwares = false;
          this.loadFirmwares(this.product.id);
        },
        error: error => {
          this.msg.warning('Failed to createProductFirmware', error);
          this.loadingFirmwares = false;
        }
      });
  }

  private delete(firmware: ProductFirmware) {
    this.loadingFirmwares = true;
    this.service.deleteProductFirmware(this.product.id, firmware.name)
      .subscribe({
        next: () => {
          console.log('deleteProductFirmware ok');
          this.loadingFirmwares = false;
          this.loadFirmwares(this.product.id);
        },
        error: error => {
          this.msg.warning('Failed to deleteProductFirmware', error);
          this.loadingFirmwares = false;
        }
      });
  }

  private update(firmware: ProductFirmware) {
    this.loadingFirmwares = true;
    this.service.updateProductFirmware(this.product.id, firmware)
      .subscribe({
        next: () => {
          console.log('updateProductFirmware ok');
          this.loadingFirmwares = false;
          this.loadFirmwares(this.product.id);
        },
        error: error => {
          this.msg.warning('Failed to updateProductFirmware', error);
          this.loadingFirmwares = false;
        }
      });
  }

  protected onView(instance: ProductFirmwareInstance) {

  }

  protected onPreview(instance: ProductFirmwareInstance) {
    this.loadingFirmwareInstances = true;
    this.service.setProductFirmwareInstanceLifecycle(this.product.id, this.currentFirmware, instance.version.code, LifeCycle.PREVIEW)
      .subscribe({
        next: () => {
          console.log('setProductFirmwareInstanceLifecycle ok');
          this.loadingFirmwareInstances = false;
          this.loadFirmwareInstances(this.product.id, this.currentFirmware);
        },
        error: error => {
          this.msg.warning('Failed to setProductFirmwareInstanceLifecycle', error);
          this.loadingFirmwareInstances = false;
        }
      });
  }

  protected cancelPreview(instance: ProductFirmwareInstance) {
    this.loadingFirmwareInstances = true;
    this.service.setProductFirmwareInstanceLifecycle(this.product.id, this.currentFirmware, instance.version.code, LifeCycle.DEVELOPMENT)
      .subscribe({
        next: () => {
          console.log('setProductFirmwareInstanceLifecycle ok');
          this.loadingFirmwareInstances = false;
          this.loadFirmwareInstances(this.product.id, this.currentFirmware);
        },
        error: error => {
          this.msg.warning('Failed to setProductFirmwareInstanceLifecycle', error);
          this.loadingFirmwareInstances = false;
        }
      });
  }

  protected onDelete(instance: ProductFirmwareInstance) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个固件吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: `版本名称：${instance.version.name}, 版本编码：${instance.version.code}`,
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.deleteFirmwareInstance(instance);
      }
    });
  }

  protected deleteFirmwareInstance(instance: ProductFirmwareInstance) {
    this.loadingFirmwareInstances = true;
    this.service.deleteProductFirmwareInstance(this.product.id, this.currentFirmware, instance.version.code)
      .subscribe({
        next: () => {
          console.log('deleteProductFirmwareInstance ok');
          this.loadingFirmwareInstances = false;
          this.loadFirmwareInstances(this.product.id, this.currentFirmware);
        },
        error: error => {
          this.msg.warning('Failed to deleteProductFirmwareInstance', error);
          this.loadingFirmwareInstances = false;
        }
      });
  }
}
