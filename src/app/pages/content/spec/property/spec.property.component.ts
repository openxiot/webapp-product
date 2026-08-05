import {Component, Input, OnChanges, OnInit, signal, SimpleChanges, ViewContainerRef} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {MainService} from '../../../../service/main.service';
import {NzTableModule, NzTableSortFn} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {
  FormatDefinition,
  LifeCycle,
  PropertyDefinition,
  PropertyType,
  UnitDefinition
} from '@openxiot/xiot-core-spec-ts';
import {AccountService} from '../../../../service/account.service';
import {NzDividerComponent, NzDividerModule} from 'ng-zorro-antd/divider';
import {RouterLink} from '@angular/router';
import {ConfirmComponent} from '../../../../common/dialog/confirm/confirm.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../service/i18n.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzButtonModule} from 'ng-zorro-antd/button';

@Component({
  selector: 'spec-property',
  standalone: true,
  templateUrl: './spec.property.component.html',
  styleUrl: './spec.property.component.less',
  imports: [
    FormsModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzDividerModule,
    NzButtonModule,
    RouterLink,
    TranslatePipe,
    NzColDirective,
    NzRowDirective,
  ],
  providers: [
    NzModalService
  ],
})
export class SpecPropertyComponent implements OnInit, OnChanges {

  protected readonly LifeCycle = LifeCycle;

  @Input()
  namespace: string = '';

  loading = signal(true);
  properties = signal<PropertyDefinition[]>([]);
  propertyMap = signal<Map<string, PropertyDefinition>>(new Map<string, PropertyDefinition>());

  loadingFormats = signal(true);
  formats = signal<Map<string, FormatDefinition>>(new Map<string, FormatDefinition>());

  loadingUnits = signal(true);
  units = signal<Map<string, UnitDefinition>>(new Map<string, UnitDefinition>());

  uuidSortFn: NzTableSortFn<PropertyDefinition> = (a: PropertyDefinition, b: PropertyDefinition): number => a.type.value - b.type.value;
  codeSortFn: NzTableSortFn<PropertyDefinition> = (a: PropertyDefinition, b: PropertyDefinition): number => a.type.name.localeCompare(b.type.name);

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
    this.loadDataFromServer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['namespace']) {
      this.loadDataFromServer();
    }
  }

  loadDataFromServer(): void {
    this.loading.set(true);
    this.service.getPropertyDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.properties.set(data);
          this.propertyMap.set(new Map(data.map(item => [item.type.name, item])));
          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      })

    this.loadingFormats.set(true);
    this.service.getFormatDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.formats.set(new Map(data.map(item => [item.type.name, item])));
          this.loadingFormats.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      })

    this.loadingUnits.set(true);
    this.service.getUnitDefinitions(this.account.ns().namespace)
      .subscribe({
        next: data => {
          this.units.set(new Map(data.map(item => [item.type.name, item])));
          this.loadingUnits.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  getFormatDescription(format: string) : string {
    const x = this.formats().get(format);
    if (x) {
      return x.description.get(this.i18n.getCurrentLang()) || format;
    }

    return format;
  }

  getUnitDescription(unit: string | null) : string {
    if (unit) {
      const x = this.units().get(unit);
      if (x) {
        return x.description.get(this.i18n.getCurrentLang()) || unit;
      }

      return '';
    } else {
      return '';
    }
  }

  getPropertyDescription(type: PropertyType): string {
    const x = this.propertyMap().get(type.name);
    if (x) {
      return x.description.get(this.i18n.getCurrentLang()) || type.name;
    } else {
      return type.name;
    }
  }

  protected onDelete(def: PropertyDefinition) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个属性定义吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: def.type.toString(),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
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
    this.loading.set(true);
    this.service.deletePropertyDefinition(def.type)
      .subscribe({
        next: data => {
          this.properties.set(this.properties().filter(x => x.type.name !== def.type.name));
          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }
}
