import {Component, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {UrnType, DeviceTemplate, LifeCycle} from "@openxiot/xiot-core-spec-ts";
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

@Component({
  selector: 'template-detail',
  templateUrl: './template.detail.component.html',
  styleUrls: ['./template.detail.component.less'],
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
export class TemplateDetailComponent implements OnInit, OnDestroy {

  protected readonly LifeCycle = LifeCycle;

  changed: boolean = false;

  // 可编辑
  editable: boolean = false;

  // 版本
  version: boolean = false;

  // 专家模式
  expert: boolean = false;

  loading: boolean = true;
  type: string = '';
  template: DeviceTemplate | undefined = undefined;

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

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
  }

  private isEditable(): boolean {
    if (this.account.isEditable()) {
      if (this.template?.lifecycle === LifeCycle.DEVELOPMENT) {
        return true;
      }
    }

    return false;
  }

  // onChanged(device: DeviceInstance) {
  //   this.changed = true;
  // }

  onClickType() {
    // if (this.template !== undefined) {
    //   window.open(this.product.getInstanceUrl(this.instance.type), '_blank');
    // }
  }

  private load(type: string): void {
    this.service.getTemplate(type).subscribe({
      next: data => {
        this.template = data;
        this.loading = false;
        this.editable = this.isEditable();
        this.changed = false;
      },
      error: error => {
        this.msg.warning(error);
      }
    })
  }

  // protected readonly UrnType = UrnType;

  // onReload() {
  //   this.load(this.type);
  //   this.changed = false;
  // }

  // onRemove(service: Service) {
  //   this.instance?.services.delete(service.iid);
  // }

  protected editTitle() {
    const modal = this.modal.create<StringValueEditComponent, StringValue, string>({
      nzTitle: this.i18n.translate.instant('修改模板描述'),
      nzContent: StringValueEditComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new StringValue(this.template?.description?.get(this.i18n.getCurrentLang()) || ''),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: true,
          type: 'primary',
          disabled: component => ! (component!.changed || false),
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.template?.description.set(this.i18n.getCurrentLang(), result);
        this.changed = true;
      }
    });
  }

  protected onReload() {
    this.load(this.type);
  }

  protected onSave() {
    if (this.template) {
      this.loading = true;
      this.service.updateTemplate(this.template)
        .subscribe({
          next: () => {
            console.log('updateTemplate ok');
            this.loading = false;
            this.changed = false;
          },
          error: error => {
            this.msg.warning(error);
            this.loading = false;
          }
        });
    }
  }

  protected onChanged() {
    this.changed = true;
  }
}
