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
import {FormatDefinition, LifeCycle} from '@openxiot/xiot-core-spec-ts';
import {AccountService} from '../../../../service/account.service';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {RouterLink} from '@angular/router';
import {ConfirmComponent} from '../../../../common/dialog/confirm/confirm.component';

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
    NzDividerComponent,
    RouterLink,
  ],
  providers: [
    NzModalService
  ],
})
export class SpecFormatComponent implements OnInit, OnChanges {

  protected readonly LifeCycle = LifeCycle;

  @Input() namespace!: string;

  loading: boolean = true;
  formats: FormatDefinition[] = [];

  codeSortFn: NzTableSortFn<FormatDefinition> = (a: FormatDefinition, b: FormatDefinition): number => a.type.name.localeCompare(b.type.name);

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['namespace']) {
      this.loadDataFromServer();
    }
  }

  loadDataFromServer(): void {
    this.loading = true;
    this.service.getFormatDefinitions(this.namespace)
      .subscribe({
        next: data => {
          this.formats = data;
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected onDelete(format: FormatDefinition) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: '您真的要删除这个格式吗？',
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: format.type.toString(),
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
        this.doDelete(format);
      }
    });
  }

  protected doDelete(format: FormatDefinition) {
    this.loading = true;
    this.service.deleteFormatDefinition(format.type)
      .subscribe({
        next: data => {
          this.formats = this.formats.filter(x => x.type.name !== format.type.name);
          this.loading = false;
        },
        error: error => {
          this.msg.warning('Failed to deleteFormatDefinition: ', error);
        }
      })
  }
}
