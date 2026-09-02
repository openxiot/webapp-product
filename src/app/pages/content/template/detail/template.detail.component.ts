import {Component, computed, OnInit, signal, ViewContainerRef} from '@angular/core';
import {DeviceTemplate, LifeCycle} from "@openxiot/xiot-core-spec-ts";
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRoute, Router} from "@angular/router";
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {BreadcrumbTranslateDirective} from '../../../../common/component/breadcrumb/breadcrumb-translate.directive';
import {
  NzPageHeaderBreadcrumbDirective,
  NzPageHeaderContentDirective,
  NzPageHeaderModule,
} from 'ng-zorro-antd/page-header';
import {NzDescriptionsComponent, NzDescriptionsItemComponent} from 'ng-zorro-antd/descriptions';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {TemplateDetailSliderComponent} from './sider/template.detail.slider.component';
import {FormsModule} from '@angular/forms';
import {NzSegmentedModule} from 'ng-zorro-antd/segmented';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {MainService} from '../../../../service/main.service';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {AccountService} from '../../../../service/account.service';
import {Location} from '@angular/common';
import {MainI18nService} from '../../../../service/i18n.service';
import {TranslatePipe} from '@ngx-translate/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {
  StringValueEditComponent
} from '../../../../common/dialog/string/string.value.edit.component';
import {StringValue} from '../../../../common/dialog/string/StringValue';
import {reduceTemplate, TemplateOp} from '../../../../typedef/template/TemplateEditor';

@Component({
  selector: 'template-detail',
  templateUrl: './template.detail.component.html',
  styleUrl: './template.detail.component.less',
  standalone: true,
  imports: [
    FormsModule,
    NzBreadCrumbModule,
    NzPageHeaderBreadcrumbDirective,
    BreadcrumbTranslateDirective,
    NzPageHeaderModule,
    NzDescriptionsComponent,
    NzDescriptionsItemComponent,
    NzPageHeaderContentDirective,
    NzMenuModule,
    NzLayoutModule,
    NzSegmentedModule,
    TemplateDetailSliderComponent,
    NzSpinComponent,
    NzTagModule,
    NzRadioModule,
    NzButtonModule,
    NzSpaceModule,
    NzSwitchModule,
    NzIconModule,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateDetailComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;

  changed = signal(false);

  /** 当前用户是否有生命周期编辑权限（已登录 + 组织匹配） */
  canEditLifecycle = computed(() => this.computeCanEditLifecycle());

  /** 是否有完整编辑权限（组织匹配 + 模板处于开发状态） */
  editable = computed(() => this.computeEditable());

  // 版本
  version: boolean = false;

  loading = signal(true);
  type: string = '';
  template = signal<DeviceTemplate | undefined>(undefined);

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    protected location : Location,
    protected account: AccountService,
    protected i18n: MainI18nService,
    private router: Router,
    private service: MainService,
    private route: ActivatedRoute,
    private msg: NzMessageService,
  ) {
    console.log('constructor');
  }

  ngOnInit(): void {
    console.log('ngOnInit');
    this.type = this.route.snapshot.params['type'];
    this.load(this.type);
  }

  /**
   * 当前用户的组织是否匹配模板创建者的组织
   * 有组织的前提是已登录
   */
  private isOrgMatch(): boolean {
    if (!this.account.login() || !this.account.organization().id || !this.template()) {
      return false;
    }
    return this.template()!.type.organization === this.account.organization().id;
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
    if (!this.isOrgMatch()) return false;
    return this.template()!.lifecycle === LifeCycle.DEVELOPMENT;
  }

  private load(type: string): void {
    this.loading.set(true);
    this.template.set(undefined);
    this.service.getTemplate(type).subscribe({
      next: data => {
        this.template.set(data);
        this.changed.set(false);
        this.loading.set(false);
      },
      error: error => {
        this.msg.warning(error);
        this.loading.set(false);
      }
    })
  }

  protected editTitle() {
    if (!this.editable()) return;

    const modal = this.modal.create<StringValueEditComponent, StringValue, string>({
      nzTitle: this.i18n.translate.instant('修改模板描述'),
      nzContent: StringValueEditComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new StringValue(this.template()?.description?.get(this.i18n.getCurrentLang()) || ''),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: true,
          type: 'primary',
          disabled: component => !(component!.changed() || false),
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.onOp({kind: 'setDeviceDescription', lang: this.i18n.getCurrentLang(), value: result});
      }
    });
  }

  protected onReload() {
    this.load(this.type);
  }

  protected onSave() {
    if (this.template()) {
      this.loading.set(true);
      this.service.updateTemplate(this.template()!)
        .subscribe({
          next: () => {
            console.log('updateTemplate ok');
            this.loading.set(false);
            this.changed.set(false);
          },
          error: error => {
            this.msg.warning(error);
            this.loading.set(false);
          }
        });
    }
  }

  /**
   * 唯一变更入口：把子树冒泡上来的 TemplateOp 交给纯 reducer，
   * 由 reducer 沿变更路径重建出【新】DeviceTemplate 引用（结构共享）。
   * 顶层 template() 换新引用后，Zoneless 下每个读方因自己的 signal input /
   * computed 值变化而被标记并重绘，不再依赖 Default 级联或手动 detectChanges()。
   */
  protected onOp(op: TemplateOp) {
    const t = this.template();
    if (!t) return;
    this.template.set(reduceTemplate(t, op));
    this.changed.set(true);
  }
}
