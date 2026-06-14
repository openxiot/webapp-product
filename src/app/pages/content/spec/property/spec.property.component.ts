import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {MainService} from '../../../../service/main.service';
import {NzTableModule, NzTableQueryParams} from 'ng-zorro-antd/table';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {FormatDefinition, LifeCycle, PropertyDefinition, PropertyType, UnitDefinition} from '@openxiot/xiot-core-spec-ts';

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
  ],
})
export class SpecPropertyComponent implements OnInit {

  loading: boolean = true;
  total: number = 0;
  properties: PropertyDefinition[] = [];
  propertyMap: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();
  pageSize = 200;
  pageIndex = 1;
  pageSizeOptions = [10, 50, 100, 200, 500];

  loadingFormats: boolean = true;
  formats: Map<string, FormatDefinition> = new Map<string, FormatDefinition>();

  loadingUnits: boolean = true;
  units: Map<string, UnitDefinition> = new Map<string, UnitDefinition>();

  constructor(
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadDataFromServer(this.pageIndex, this.pageSize);
  }

  loadDataFromServer(
    pageIndex: number,
    pageSize: number,
  ): void {
    this.loading = true;
    this.service.getSpecProperties('jd', pageIndex, pageSize)
      .subscribe({
        next: data => {
          this.total = data.total;
          this.properties = data.properties;
          this.propertyMap = new Map(data.properties.map(item => [item.type.name, item]));
          this.loading = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecProperties: ', error);
        }
      })

    this.loadingFormats = true;
    this.service.getSpecFormats('jd', 1, 100)
      .subscribe({
        next: data => {
          this.formats = new Map(data.formats.map(item => [item.type.name, item]));
          this.loadingFormats = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecFormats: ', error);
        }
      })

    this.loadingUnits = true;
    this.service.getSpecUnits('jd', 1, 100)
      .subscribe({
        next: data => {
          this.units = new Map(data.units.map(item => [item.type.name, item]));
          this.loadingUnits = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecUnits: ', error);
        }
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    const { pageSize, pageIndex } = params;
    this.loadDataFromServer(pageIndex, pageSize);
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

  protected readonly LifeCycle = LifeCycle;
}
