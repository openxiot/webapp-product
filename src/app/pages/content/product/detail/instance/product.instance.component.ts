import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewContainerRef} from '@angular/core';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzListModule} from 'ng-zorro-antd/list';
import {
  DeviceInstance, DeviceInstanceCodec, LifeCycle,
  ObjectWithLifecycle,
  Product,
  ProductInstance,
  Service,
  Urn,
  UrnType
} from '@openxiot/xiot-core-spec-ts';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {FormsModule} from '@angular/forms';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {ToolbarComponent} from '../../../../../components/toolbar/toolbar.component';
import {DeviceInstanceComponent} from '../../../../../common/device/instance/device.instance.component';
import {MainService} from '../../../../../service/main.service';
import {NzSpinModule} from 'ng-zorro-antd/spin';

@Component({
  selector: 'product-instance',
  templateUrl: './product.instance.component.html',
  styleUrls: ['./product.instance.component.less'],
  standalone: true,
  imports: [
    FormsModule,
    NzMenuModule,
    NzLayoutModule,
    NzListModule,
    NzSelectModule,
    NzButtonComponent,
    NzSpaceModule,
    NzTagComponent,
    NzColDirective,
    NzRowDirective,
    NzSpinModule,
    ToolbarComponent,
    DeviceInstanceComponent,
  ],
  providers: [
    NzModalService
  ],
})
export class ProductInstanceComponent implements OnChanges {

  @Input() product: Product = new Product(0, '', '', Urn.create('joy-spec', UrnType.DEVICE, 'switch', '00000000'), '', '');
  @Output() changed = new EventEmitter<DeviceInstance>();
  @Output() removed = new EventEmitter<Service>();

  protected readonly LifeCycle = LifeCycle;

  style: number = 1;
  version: boolean = false;
  language: string = 'zh-CN';
  instances: ProductInstance[] = [];
  loadingInstances: boolean = false;
  device: ObjectWithLifecycle<DeviceInstance> | undefined = undefined;
  loadingInstance: boolean = false;
  currentVersion: string = '1';
  isChanged: boolean = false;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private msg: NzMessageService,
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
    this.device = undefined;
    this.service.getProductInstances(productId).subscribe({
      next: data => {
        this.instances = data;
        this.instances.sort((a, b) => (b.type?.version || 0) - (a.type?.version || 0))
        this.loadingInstances = false;

        if (this.instances.length > 0) {
          this.currentVersion = this.instances[0].type?.version.toString() || '0';
          this.loadInstance(this.instances[0].type?.toString() || '');
        } else {
          this.msg.warning('没有产品功能定义，请创建产品功能');
        }
      },
      error: error => {
        this.msg.warning('Failed to getProductInstances', error);
      }
    });
  }

  private loadInstance(type: string) {
    if (type.length > 0) {
      this.loadingInstance = true;
      this.service.getProductInstance(type).subscribe({
        next: data => {
          this.device = data;
          this.loadingInstance = false;
        },
        error: error => {
          this.msg.warning('Failed to getProductInstance', error);
        }
      });
    } else {
      this.msg.warning('type invalid');
    }
  }

  protected get currentInstance(): ProductInstance | undefined {
    return this.instances.find(instance => instance.type?.version.toString() === this.currentVersion);
  }

  protected onCurrentVersionChanged($event: any) {
    const found = this.instances.find(x => x.type?.version.toString() === this.currentVersion);
    if (found) {
      this.loadInstance(found.type?.toString() || '');
    }
  }

  protected get lastVersion(): boolean {
    if (this.instances.length === 0) {
      return false;
    }

    return this.instances[0].type?.version.toString() === this.currentVersion;
  }

  protected onCancel() {
    this.isChanged = false;
    this.loadInstances(this.product.id);
  }

  protected onSave() {
    if (this.device) {
      this.loadingInstance = true;

      this.service.updateProductInstance(this.device.value)
        .subscribe({
          next: () => {
            console.log('updateProductInstance ok');
            this.loadingInstance = false;
            this.isChanged = false;
            this.msg.info("更新产品功能：完成！")
          },
          error: error => {
            this.msg.warning('Failed to updateProductInstance', error);
            this.loadingInstance = false;
            this.msg.info("更新产品功能：失败!", error)
          }
        });
    }
  }

  protected onPreview() {
    const instance = this.currentInstance;
    if (instance) {
      const type = instance.type?.toString() || '';
      if (type.length > 0) {
        this.loadingInstance = true;
        this.service.setProductInstanceLifecycle(type, LifeCycle.PREVIEW)
          .subscribe({
            next: () => {
              console.log('setProductInstanceLifecycle ok');
              this.loadingInstance = false;

              instance.lifecycle = LifeCycle.PREVIEW;

              if (this.device) {
                this.device.lifecycle = LifeCycle.PREVIEW;
              }
            },
            error: error => {
              this.msg.warning('Failed to setProductInstanceLifecycle', error);
              this.loadingInstance = false;
              this.loadInstances(this.product.id);
            }
          });
      }
    }
  }

  protected onCancelPreview() {
    const instance = this.currentInstance;
    if (instance) {
      const type = instance.type?.toString() || '';
      if (type.length > 0) {
        this.loadingInstance = true;
        this.service.setProductInstanceLifecycle(type, LifeCycle.DEVELOPMENT)
          .subscribe({
            next: () => {
              console.log('setProductInstanceLifecycle ok');
              this.loadingInstance = false;

              instance.lifecycle = LifeCycle.DEVELOPMENT;

              if (this.device) {
                this.device.lifecycle = LifeCycle.DEVELOPMENT;
              }
            },
            error: error => {
              this.msg.warning('Failed to setProductInstanceLifecycle', error);
              this.loadingInstance = false;
              this.loadInstances(this.product.id);
            }
          });
      }
    }
  }

  protected onFirstInstance() {

  }

  protected onChanged(device: DeviceInstance) {
    console.log('onChanged!');

    if (! this.loadingInstance) {
      this.isChanged = true;
    }
  }

  protected onDownload() {
    if (this.device) {
      const data = DeviceInstanceCodec.encode(this.device.value);

      // 1. 将数据转换为 JSON 字符串
      const jsonString = JSON.stringify(data, null, 2); // 第三个参数是缩进空格数

      // 2. 创建 Blob 对象
      const blob = new Blob([jsonString], { type: 'application/json' });

      // 3. 创建下载链接
      const url = window.URL.createObjectURL(blob);

      // 4. 创建临时链接元素
      const link = document.createElement('a');
      link.href = url;
      link.download = `data-${new Date().getTime()}.json`; // 设置文件名

      // 5. 触发点击下载
      link.click();

      // 6. 清理 URL 对象
      window.URL.revokeObjectURL(url);
    }
  }
}
