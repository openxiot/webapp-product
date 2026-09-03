import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
  computed,
  signal
} from '@angular/core';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzListModule} from 'ng-zorro-antd/list';
import {
  DeviceInstance,
  DeviceInstanceCodec, FormatDefinition,
  LifeCycle,
  ProductBasic,
  ProductInstance,
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
import {
  InstanceOp,
  reduceInstance
} from '../../../../../typedef/instance/InstanceEditor';
import {AccountService} from '../../../../../service/account.service';
import {ProductInstanceViewJsonComponent} from './dialog/product.instance.view.json.component';
import {MainI18nService} from '../../../../../service/i18n.service';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';

@Component({
  selector: 'product-instance',
  templateUrl: './product.instance.component.html',
  styleUrl: './product.instance.component.less',
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

  protected readonly LifeCycle = LifeCycle;

  /** 是否有完整编辑权限（组织匹配 + 产品实例开发状态）：由 instance()/account 推导，Zoneless 下自动响应。 */
  editable = computed(() => this.computeEditable());

  version: boolean = false;
  language: string = 'zh-CN';

  loadingInstances = signal(false);
  instances = signal<ProductInstance[]>([]);

  loadingInstance = signal(false);
  instance = signal<DeviceInstance | undefined>(undefined);

  currentVersion = signal('1');
  isChanged = signal(false);
  firstInstance = signal(false);

  loadingTemplate = signal(false);
  loadingDeviceDefinition = signal(false);

  loadingFormats = signal(false);
  formats = signal<FormatDefinition[]>([]);

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

  private loadFormats(ns: string): void {
    this.loadingFormats.set(true);
    this.service.getFormatDefinitions(ns)
      .subscribe({
        next: data => {
          this.formats.set(data);
          this.loadingFormats.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loadingFormats.set(false);
        }
      })
  }

  /**
   * 当前用户的组织是否匹配模板创建者的组织
   * 有组织的前提是已登录
   */
  private isOrgMatch(): boolean {
    if (!this.account.login() || !this.account.organization().id || !this.instance()) {
      return false;
    }
    return this.instance()!.type.organization === this.account.organization().id;
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

    if (!this.instance()) {
      console.log('instance is null');
      return false;
    }

    console.log('instance.lifecycle: ', this.instance()!.lifecycle);

    return this.instance()!.lifecycle === LifeCycle.DEVELOPMENT;
  }

  private loadInstances(productId: string) {
    this.loadingInstances.set(true);
    this.instance.set(undefined);
    this.service.getProductInstances(productId).subscribe({
      next: data => {
        this.instances.set([...data].sort((a, b) => (b.type?.version || 0) - (a.type?.version || 0)));
        this.loadingInstances.set(false);

        if (this.instances().length > 0) {
          this.currentVersion.set(this.instances()[0].type?.version.toString() || '0');
          this.loadInstance(this.instances()[0].type?.toString() || '');
          this.loadFormats(this.instances()[0].type?.ns || '');
        } else {
          // 无版本：清掉上一产品残留的 formats，避免 create-first 误用过期 ns 的格式集。
          this.formats.set([]);
        }
      },
      error: error => {
        this.msg.warning(error);
        this.loadingInstances.set(false);
      }
    });
  }

  private loadInstance(type: string) {
    if (type.length > 0) {
      this.loadingInstance.set(true);
      this.service.getProductInstance(type).subscribe({
        next: data => {
          this.instance.set(data);
          this.loadingInstance.set(false);

          console.log('this.instance.services.size: ' + this.instance()!.services.size);

          console.log('editable: ' + this.editable());
        },
        error: error => {
          this.msg.warning(error);
          this.loadingInstance.set(false);
        }
      });
    } else {
      this.msg.warning('type invalid');
    }
  }

  protected get currentInstance(): ProductInstance | undefined {
    return this.instances().find(instance => instance.type?.version.toString() === this.currentVersion());
  }

  protected onCurrentVersionChanged($event: any) {
    this.currentVersion.set(String($event));
    const found = this.instances().find(x => x.type?.version.toString() === String($event));
    if (found) {
      this.loadInstance(found.type?.toString() || '');
    }
  }

  protected get lastVersion(): boolean {
    if (this.instances().length === 0) {
      return false;
    }

    return this.instances()[0].type?.version.toString() === this.currentVersion();
  }

  protected onCancel() {
    this.isChanged.set(false);
    this.loadInstances(this.product.id);
  }

  protected onSave() {
    if (this.instance()) {
      if (this.firstInstance()) {
        this.loadingInstance.set(true);
        this.service.createProductInstance(this.instance()!).subscribe({
          next: () => {
            console.log('createProductInstance ok');
            this.loadingInstance.set(false);
            this.isChanged.set(false);
            this.msg.info("创建产品功能：完成！")
          },
          error: error => {
            this.msg.warning(error);
            this.loadingInstance.set(false);
            this.msg.info("创建产品功能：失败!", error)
          }
        });
      } else {
        this.loadingInstance.set(true);
        this.service.updateProductInstance(this.instance()!).subscribe({
          next: () => {
            console.log('updateProductInstance ok');
            this.loadingInstance.set(false);
            this.isChanged.set(false);
            this.msg.info("更新产品功能：完成！")
          },
          error: error => {
            this.msg.warning(error);
            this.loadingInstance.set(false);
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
        this.loadingInstance.set(true);
        this.service.setProductInstanceLifecycle(type, lifecycle)
          .subscribe({
            next: () => {
              console.log('setProductInstanceLifecycle ok: ', lifecycle);
              this.loadingInstance.set(false);

              instance.lifecycle = lifecycle;

              // 以 reducer 产出新实例对象更新详情（保持不可变）；editable 是 computed，自动随 lifecycle 切换。
              this.onOp({kind: 'setInstanceLifecycle', lifecycle});
              // 替换数组引用，让模板中 currentInstance?.lifecycle 的 switch 在 Zoneless 下重新渲染
              this.instances.update(list => [...list]);
            },
            error: error => {
              this.msg.warning(error);
              this.loadingInstance.set(false);
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
    this.loadingTemplate.set(true);
    this.service.getTemplate(type).subscribe({
      next: data => {
        console.log('getTemplate ok');
        this.instance.set(ProductInstanceHelper.fromTemplate(this.i18n.getCurrentLang(), this.product.organization, this.product.model, data));
        this.isChanged.set(true);
        this.instances.update(list => [...list, new ProductInstance(LifeCycle.DEVELOPMENT, this.instance()!.type)]);
        this.firstInstance.set(true);
        // create-first：实例已存在，按其实例类型 ns 加载属性格式集，避免下拉为空/残留。
        this.loadFormats(this.instance()!.type?.ns || '');

        this.loadingTemplate.set(false);
      },
      error: error => {
        this.msg.warning(error);
        this.loadingTemplate.set(false);
      }
    });
  }

  private loadDevice(type: string) {
    this.loadingDeviceDefinition.set(true);
    this.service.getDeviceDefinition(type).subscribe({
      next: data => {
        console.log('getDeviceDefinition ok');

        this.instance.set(ProductInstanceHelper.fromDefinition(this.i18n.getCurrentLang(), this.product.organization, this.product.model, data));
        this.isChanged.set(true);
        this.instances.update(list => [...list, new ProductInstance(LifeCycle.DEVELOPMENT, this.instance()!.type)]);
        this.firstInstance.set(true);
        // create-first：实例已存在，按其实例类型 ns 加载属性格式集，避免下拉为空/残留。
        this.loadFormats(this.instance()!.type?.ns || '');

        this.loadingDeviceDefinition.set(false);
      },
      error: error => {
        this.msg.warning(error);
        this.loadingDeviceDefinition.set(false);
      }
    });
  }

  /** 详情子树所有编辑的唯一入口：reducer 产出新 instance，Zoneless 自动沿脏路径重绘。 */
  protected onOp(op: InstanceOp) {
    const i = this.instance();
    if (!i) return;
    this.instance.set(reduceInstance(i, op));
    // 生命周期切换不是内容修改；加载过渡期收到的编辑不标脏（同旧逻辑）。
    if (op.kind !== 'setInstanceLifecycle' && !this.loadingInstance()) {
      this.isChanged.set(true);
    }
  }

  protected onViewJson() {
    if (this.instance()) {
      const instance = this.instance()!;
      const modal = this.modal.create<ProductInstanceViewJsonComponent, any, any>({
        nzWidth: 1024,
        nzTitle: this.i18n.translate.instant('产品功能'),
        nzContent: ProductInstanceViewJsonComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzData: DeviceInstanceCodec.encode(instance),
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
          this.onDownload(result, instance.type!.version || 0);
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
