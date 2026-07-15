import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewContainerRef} from '@angular/core';
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
import {LifeCycle, UnitDefinition} from '@openxiot/xiot-core-spec-ts';
import {AccountService} from '../../../../service/account.service';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {RouterLink} from '@angular/router';
import {ConfirmComponent} from '../../../../common/dialog/confirm/confirm.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../service/i18n.service';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

@Component({
  selector: 'spec-unit',
  standalone: true,
  templateUrl: './spec.unit.component.html',
  styleUrl: './spec.unit.component.less',
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
    RouterLink,
    TranslatePipe,
    NzButtonModule,
    NzWaveDirective,
    NzRowDirective,
    NzColDirective,
  ],
  providers: [
    NzModalService
  ],
})
export class SpecUnitComponent implements OnInit, OnChanges {

  protected readonly LifeCycle = LifeCycle;

  @Input()
  namespace: string = '';

  loading: boolean = true;
  units: UnitDefinition[] = [];

  codeSortFn: NzTableSortFn<UnitDefinition> = (a: UnitDefinition, b: UnitDefinition): number => a.type.name.localeCompare(b.type.name);

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
    this.loading = true;
    this.service.getUnitDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.units = data;
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected onDelete(unit: UnitDefinition) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个单位吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: unit.type.toString(),
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
        this.doDelete(unit);
      }
    });
  }

  protected doDelete(unit: UnitDefinition) {
    this.loading = true;
    this.service.deleteUnitDefinition(unit.type)
      .subscribe({
        next: data => {
          this.units = this.units.filter(x => x.type.name !== unit.type.name);
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }
}
