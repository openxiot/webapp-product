import {Component, OnDestroy, OnInit} from '@angular/core';
import {UrnType, DeviceTemplate} from "@openxiot/xiot-core-spec-ts";
import {NzMessageService} from "ng-zorro-antd/message";
import {ActivatedRoute, Router} from "@angular/router";
import {NzBreadCrumbComponent} from 'ng-zorro-antd/breadcrumb';
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

@Component({
  selector: 'template-detail',
  templateUrl: './template.detail.component.html',
  styleUrls: ['./template.detail.component.less'],
  standalone: true,
  imports: [
    FormsModule,
    NzBreadCrumbComponent,
    NzPageHeaderBreadcrumbDirective,
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
  ],
  providers: [],
})
export class TemplateDetailComponent implements OnInit, OnDestroy {

  changed: boolean = false;

  // 语言
  language: string = 'zh-CN';

  // 版本
  version: boolean = false;

  // 专家模式
  expert: boolean = false;

  loading: boolean = true;
  type: string = '';
  template: DeviceTemplate | undefined = undefined;

  constructor(
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
      },
      error: error => {
        this.msg.warning(error);
      }
    })
  }

  protected readonly UrnType = UrnType;

  // onReload() {
  //   this.load(this.type);
  //   this.changed = false;
  // }

  // onRemove(service: Service) {
  //   this.instance?.services.delete(service.iid);
  // }
}
