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
import {LifeCycle, ObjectWithLifecycle, UnitDefinition} from '@openxiot/xiot-core-spec-ts';
import {AccountService} from '../../../../service/account.service';

@Component({
  selector: 'spec-unit',
  standalone: true,
  templateUrl: './spec.unit.component.html',
  styleUrls: ['./spec.unit.component.less'],
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
export class SpecUnitComponent implements OnInit {

  loading: boolean = true;
  units: UnitDefinition[] = [];

  constructor(
    private account: AccountService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadDataFromServer();
  }

  loadDataFromServer(): void {
    this.loading = true;
    this.service.getSpecUnits(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.units = data;
          this.loading = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecUnits: ', error);
        }
      })
  }

  protected readonly LifeCycle = LifeCycle;
}
