import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
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
import {TemplateSummary, Urn} from '@openxiot/xiot-core-spec-ts';
import {RouterLink} from '@angular/router';
import {AccountService} from '../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {NzIconDirective} from 'ng-zorro-antd/icon';

@Component({
  selector: 'main-template',
  standalone: true,
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
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
  ],
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
    public account: AccountService,
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
        this.msg.warning('Failed to load products');
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
}
