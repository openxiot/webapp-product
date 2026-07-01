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
  DeviceInstance,
  DeviceInstanceCodec,
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
import {ProductInstanceDetailComponent} from './detail/product.instance.detail.component';
import {MainService} from '../../../../../service/main.service';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {TranslatePipe} from '@ngx-translate/core';
import {ProductInstanceHelper} from '../../../../../typedef/instance/ProductInstanceHelper';
import {AccountService} from '../../../../../service/account.service';
import {ProductInstanceViewJsonComponent} from './dialog/product.instance.view.json.component';
import {MainI18nService} from '../../../../../service/i18n.service';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';

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
    ProductInstanceDetailComponent,
    TranslatePipe,
    NzWaveDirective,
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

  /** 是否有完整编辑权限（组织匹配 + 产品实例开发状态） */
  editable: boolean = false;

  version: boolean = false;
  language: string = 'zh-CN';

  loadingInstances: boolean = false;
  instances: ProductInstance[] = [];

  loadingInstance: boolean = false;
  instance: DeviceInstance | undefined = undefined;

  currentVersion: string = '1';
  isChanged: boolean = false;
  firstInstance: boolean = false;

  loadingTemplate: boolean = false;
  loadingDeviceDefinition: boolean = false;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private account: AccountService,
    private i18n: MainI18nService,
    private msg: NzMessageService,
    private service: MainService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.loadInstances(this.product.id);
    }
  }

  /**
   * 当前用户的组织是否匹配模板创建者的组织
   * 有组织的前提是已登录
   */
  private isOrgMatch(): boolean {
    if (!this.account.login || !this.account.organization || !this.instance) {
      return false;
    }
    return this.instance.type.organization === this.account.organization.id;
  }

  /**
   * 计算是否可编辑生命周期（已登录 + 组织匹配）
   */
  private computeCanEditLifecycle(): boolean {
    return this.isOrgMatch();
  }

  /**
   * 计算是否有完整编辑权限（已登录 + 组织匹配 + 开发状态）
   */
  private computeEditable(): boolean {
    if (!this.isOrgMatch()) {
      console.log('isOrgMatch: ', this.isOrgMatch());
      return false;
    }

    if (!this.instance) {
      console.log('instance is null');
      return false;
    }

    return this.instance.lifecycle === LifeCycle.DEVELOPMENT;
  }

  private loadInstances(productId: string) {
    this.loadingInstances = true;
    this.instance = undefined;
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
          this.instance = data;
          this.editable = this.computeEditable();
          this.loadingInstance = false;

          console.log('this.instance.services.size: ' + this.instance.services.size);

          console.log('editable: ' + this.editable);
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
    if (this.instance) {
      if (this.firstInstance) {
        this.loadingInstance = true;
        this.service.createProductInstance(this.instance).subscribe({
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
        this.service.updateProductInstance(this.instance).subscribe({
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
  protected onReleased() {
    this.setLifecycle(LifeCycle.RELEASED);
  }

  protected onPreview() {
    this.setLifecycle(LifeCycle.PREVIEW);
  }

  protected onDevelopment() {
    this.setLifecycle(LifeCycle.DEVELOPMENT);
  }

  private setLifecycle(lifecycle: LifeCycle) {
    const instance = this.currentInstance;
    if (instance) {
      const type = instance.type?.toString() || '';
      if (type.length > 0) {
        this.loadingInstance = true;
        this.service.setProductInstanceLifecycle(type, lifecycle)
          .subscribe({
            next: () => {
              console.log('setProductInstanceLifecycle ok');
              this.loadingInstance = false;

              instance.lifecycle = lifecycle;

              if (this.instance) {
                this.instance.lifecycle = lifecycle;
              }

              this.editable = this.computeEditable();
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
        this.instance = ProductInstanceHelper.fromTemplate(this.product.organization, this.product.model, data);
        this.isChanged = true;
        this.instances.push(new ProductInstance(LifeCycle.DEVELOPMENT, this.instance.type))
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

        this.instance = ProductInstanceHelper.fromDefinition(this.product.organization, this.product.model, data);
        this.isChanged = true;
        this.instances.push(new ProductInstance(LifeCycle.DEVELOPMENT, this.instance.type))
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

  protected onViewJson() {
    if (this.instance) {
      const modal = this.modal.create<ProductInstanceViewJsonComponent, any, any>({
        nzWidth: 1024,
        nzTitle: this.i18n.translate.instant('产品功能'),
        nzContent: ProductInstanceViewJsonComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzData: DeviceInstanceCodec.encode(this.instance),
        nzFooter: [
          {
            label: this.i18n.translate.instant('下载'),
            onClick: component => component!.ok()
          },
          {
            label: this.i18n.translate.instant('关闭'),
            type: 'primary',
            onClick: component => component!.cancel()
          }
        ],
      });

      modal.afterClose.subscribe(result => {
        if (result) {
          this.onDownload(result, this.instance!.type!.version || 0);
        }
      });
    }
  }

  protected onDownload(data: any, version: number) {
    // 1. 将数据转换为 JSON 字符串
    const jsonString = JSON.stringify(data, null, 2); // 第三个参数是缩进空格数

    // 2. 创建 Blob 对象
    const blob = new Blob([jsonString], {type: 'application/json'});

    // 3. 创建下载链接
    const url = window.URL.createObjectURL(blob);

    // 4. 创建临时链接元素
    const link = document.createElement('a');
    link.href = url;
    // link.download = `product-${new Date().getTime()}.json`; // 设置文件名
    link.download = `product-${this.product.id}-${version}.json`; // 设置文件名

    // 5. 触发点击下载
    link.click();

    // 6. 清理 URL 对象
    window.URL.revokeObjectURL(url);
  }
}
