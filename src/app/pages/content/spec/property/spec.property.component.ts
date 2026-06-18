import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {MainService} from '../../../../service/main.service';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {
  FormatDefinition,
  LifeCycle,
  PropertyDefinition,
  PropertyType,
  UnitDefinition
} from '@openxiot/xiot-core-spec-ts';
import {AccountService} from '../../../../service/account.service';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {RouterLink} from '@angular/router';
import {ConfirmComponent} from '../../../../common/dialog/confirm/confirm.component';
import {NzModalService} from 'ng-zorro-antd/modal';

@Component({
  selector: 'spec-property',
  standalone: true,
  templateUrl: './spec.property.component.html',
  styleUrls: ['./spec.property.component.less'],
  imports: [
    FormsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzDividerComponent,
    RouterLink,
  ],
  providers: [
    NzModalService
  ],
})
export class SpecPropertyComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;

  loading: boolean = true;
  properties: PropertyDefinition[] = [];
  propertyMap: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  loadingFormats: boolean = true;
  formats: Map<string, FormatDefinition> = new Map<string, FormatDefinition>();

  loadingUnits: boolean = true;
  units: Map<string, UnitDefinition> = new Map<string, UnitDefinition>();

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadDataFromServer();
  }

  loadDataFromServer(): void {
    this.loading = true;
    this.service.getPropertyDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.properties = data;
          this.propertyMap = new Map(data.map(item => [item.type.name, item]));
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })

    this.loadingFormats = true;
    this.service.getFormatDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.formats = new Map(data.map(item => [item.type.name, item]));
          this.loadingFormats = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })

    this.loadingUnits = true;
    this.service.getUnitDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.units = new Map(data.map(item => [item.type.name, item]));
          this.loadingUnits = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  getFormatDescription(format: string) : string {
    const x = this.formats.get(format);
    if (x) {
      return x.description.get('zh-CN') || format;
    }

    return format;
  }

  getUnitDescription(unit: string | null) : string {
    if (unit) {
      const x = this.units.get(unit);
      if (x) {
        return x.description.get('zh-CN') || unit;
      }

      return '';
    } else {
      return '';
    }
  }

  getPropertyDescription(type: PropertyType): string {
    const x = this.propertyMap.get(type.name);
    if (x) {
      return x.description.get('zh-CN') || type.name;
    } else {
      return type.name;
    }
  }

  protected onDelete(def: PropertyDefinition) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: '您真的要删除这个属性定义吗？',
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: def.type.toString(),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '确认',
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.doDelete(def);
      }
    });
  }

  protected doDelete(def: PropertyDefinition) {
    this.loading = true;
    this.service.deletePropertyDefinition(def.type)
      .subscribe({
        next: data => {
          this.properties = this.properties.filter(x => x.type.name !== def.type.name);
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }
}
