import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {BreadcrumbTranslateDirective} from '../../../common/component/breadcrumb/breadcrumb-translate.directive';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzSegmentedComponent, NzSegmentedOptions} from 'ng-zorro-antd/segmented';
import {FormsModule} from '@angular/forms';
import {TemplateGridComponent} from './view/grid/template.grid.component';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {TemplateListComponent} from './view/list/template.list.component';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {TemplateFilterTypeComponent} from './filter/type/template.filter.type.component';
import {Type} from '../../../typedef/define/Type';
import {NamespaceDefinition, TemplateSummary, Urn} from '@openxiot/xiot-core-spec-ts';
import {RouterLink} from '@angular/router';
import {AccountService} from '../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NamespaceSelectorComponent} from '../../../common/dialog/namespace/namespace.selector.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {MainI18nService} from '../../../service/i18n.service';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {NamespaceOption} from '../../../common/dialog/namespace/NamespaceOption';

@Component({
  selector: 'main-template',
  standalone: true,
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    BreadcrumbTranslateDirective,
    NzSpinModule,
    NzSegmentedComponent,
    NzRowDirective,
    NzColDirective,
    FormsModule,
    TemplateGridComponent,
    TemplateListComponent,
    TemplateFilterTypeComponent,
    RouterLink,
    TranslatePipe,
    NzIconDirective,
    NzButtonComponent,
    NzWaveDirective,
  ],
  providers: [
    NzModalService
  ]
})
export class TemplateComponent implements OnInit {

  viewOptions: NzSegmentedOptions = [
    {value: 'Card', icon: 'appstore'},
    {value: 'List', icon: 'bars'}
  ];
  viewMode: number = 0;

  loading: boolean = false;
  templates: TemplateSummary[] = [];
  templatesOriginal: TemplateSummary[] = [];

  types: Type[] = [];
  typesSelected: Set<string> = new Set<string>();

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public account: AccountService,
    public i18n: MainI18nService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    if (this.account.ns) {
      this.loadTemplates();
    }
  }

  loadTemplates() {
    this.loading = true;
    this.service.getTemplates(this.account.ns.namespace).subscribe({
      next: data => {
        this.templatesOriginal = data;
        this.templates = data;
        this.types = this.getTypes();
        this.typesSelected = new Set(this.types.map(x => x.code));
        this.loading = false;
      },
      error: error => {
        this.msg.warning(error);
      }
    })
  }

  getTypes(): Type[] {
    let map: Map<string, Urn> = new Map<string, Urn>();

    for (const x of this.templates) {
      map.set(x.type.name, x.type);
    }

    return Array.from(map.values()).map(x => new Type(x.name, x.name));
  }

  onTypesSelected(value: Set<string>) {
    this.typesSelected = value;
    this.updateProducts();
  }

  updateProducts() {
    this.templates = this.templatesOriginal
      .filter(x => this.typesSelected.has(x.type.name))
  }

  protected changeNamespace(): void {
    const modal = this.modal.create<NamespaceSelectorComponent, NamespaceOption, NamespaceDefinition>({
      nzTitle: '',
      nzWidth: 800,
      nzContent: NamespaceSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new NamespaceOption(this.account.ns?.namespace || ''),
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.account.ns = result;
        this.loadTemplates();
      }
    });
  }

  protected onRemove(type: string) {
    this.loading = true;
    this.service.removeTemplate(type).subscribe({
      next: data => {
        this.loadTemplates()
        this.loading = false;
      },
      error: error => {
        this.msg.warning(error);
      }
    })
  }
}
