import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzListModule} from 'ng-zorro-antd/list';
import {
  DeviceDefinition,
  DeviceInstance,
  DeviceInstanceCodec,
  DeviceTemplate,
  LifeCycle,
  ProductBasic,
  ProductInstance,
  Service,
  Urn,
  UrnStyle,
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
import {TranslatePipe} from '@ngx-translate/core';
import {ProductInstanceHelper} from '../../../../../typedef/instance/ProductInstanceHelper';

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
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class ProductInstanceComponent implements OnChanges {

  @Input() product: ProductBasic = new ProductBasic('', '', '', Urn.create('', UrnType.DEVICE, 'switch', '00000000'), '');
  @Output() changed = new EventEmitter<DeviceInstance>();
  @Output() removed = new EventEmitter<Service>();

  protected readonly LifeCycle = LifeCycle;

  style: number = 1;
  version: boolean = false;
  language: string = 'zh-CN';

  loadingInstances: boolean = false;
  instances: ProductInstance[] = [];

  loadingInstance: boolean = false;
  device: DeviceInstance | undefined = undefined;

  currentVersion: string = '1';
  isChanged: boolean = false;
  firstInstance: boolean = false;

  loadingTemplate: boolean = false;
  loadingDeviceDefinition: boolean = false;

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

  private loadInstances(productId: string) {
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
        }
      },
      error: error => {
        this.msg.warning(error);
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
          this.msg.warning(error);
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
      if (this.firstInstance) {
        this.loadingInstance = true;
        this.service.createProductInstance(this.device).subscribe({
            next: () => {
              console.log('createProductInstance ok');
              this.loadingInstance = false;
              this.isChanged = false;
              this.msg.info("创建产品功能：完成！")
            },
            error: error => {
              this.msg.warning(error);
              this.loadingInstance = false;
              this.msg.info("创建产品功能：失败!", error)
            }
          });
      } else {
        this.loadingInstance = true;
        this.service.updateProductInstance(this.device).subscribe({
            next: () => {
              console.log('updateProductInstance ok');
              this.loadingInstance = false;
              this.isChanged = false;
              this.msg.info("更新产品功能：完成！")
            },
            error: error => {
              this.msg.warning(error);
              this.loadingInstance = false;
              this.msg.info("更新产品功能：失败!", error)
            }
          });
      }
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
              this.msg.warning(error);
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
              this.msg.warning(error);
              this.loadingInstance = false;
              this.loadInstances(this.product.id);
            }
          });
      }
    }
  }

  protected onCreateFirstInstance() {
    console.log('onCreateFirstInstance!');

    switch (this.product.template.style) {
      case UrnStyle.SPEC:
        this.loadDevice(this.product.template.toString());
        break;

      case UrnStyle.XIOT:
        this.loadTemplate(this.product.template.toString());
        break;

      default:
        console.error('onCreateFirstInstance failed: ' + this.product.template);
        break;
    }
  }

  private loadTemplate(type: string) {
    this.loadingTemplate = true;
    this.service.getTemplate(type).subscribe({
      next: data => {
        console.log('getTemplate ok');
        this.device = ProductInstanceHelper.fromTemplate(this.product.organization, this.product.model, data);
        this.isChanged = true;
        this.instances.push(new ProductInstance(LifeCycle.DEVELOPMENT, this.device.type))
        this.firstInstance = true;

        this.loadingTemplate = false;
      },
      error: error => {
        this.msg.warning(error);
        this.loadingTemplate = false;
      }
    });
  }

  private loadDevice(type: string) {
    this.loadingDeviceDefinition = true;
    this.service.getDeviceDefinition(type).subscribe({
      next: data => {
        console.log('getDeviceDefinition ok');

        this.device = ProductInstanceHelper.fromDefinition(this.product.organization, this.product.model, data);
        this.isChanged = true;
        this.instances.push(new ProductInstance(LifeCycle.DEVELOPMENT, this.device.type))
        this.firstInstance = true;

        this.loadingDeviceDefinition = false;
      },
      error: error => {
        this.msg.warning(error);
        this.loadingDeviceDefinition = false;
      }
    });
  }

  protected onChanged(device: DeviceInstance) {
    console.log('onChanged!');

    if (!this.loadingInstance) {
      this.isChanged = true;
    }
  }

  protected onDownload() {
    if (this.device) {
      const data = DeviceInstanceCodec.encode(this.device);

      // 1. 将数据转换为 JSON 字符串
      const jsonString = JSON.stringify(data, null, 2); // 第三个参数是缩进空格数

      // 2. 创建 Blob 对象
      const blob = new Blob([jsonString], {type: 'application/json'});

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
