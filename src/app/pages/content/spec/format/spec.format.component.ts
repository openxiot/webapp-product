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
import {FormatDefinition, LifeCycle, ObjectWithLifecycle} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'spec-format',
  standalone: true,
  templateUrl: './spec.format.component.html',
  styleUrls: ['./spec.format.component.less'],
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
export class SpecFormatComponent implements OnInit {

  loading: boolean = true;
  total: number = 0;
  formats: ObjectWithLifecycle<FormatDefinition>[] = [];
  pageSize = 100;
  pageIndex = 1;
  pageSizeOptions = [10, 50, 100, 200, 500];

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
    this.service.getSpecFormats('jd', pageIndex, pageSize)
      .subscribe({
        next: data => {
          this.formats = data.formats;
          this.total = data.total;
          this.loading = false;
          this.total = this.formats.length;
        },
        error: error => {
          this.msg.warning('Failed to getSpecFormats: ', error);
        }
      })
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    console.log(params);
    const { pageSize, pageIndex } = params;
    this.loadDataFromServer(pageIndex, pageSize);
  }

  protected readonly LifeCycle = LifeCycle;
}
