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
import {ConfirmComponent} from '../../../../common/dialog/confirm/confirm.component';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../service/i18n.service';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {FormatsSelectorComponent} from '../../../../common/dialog/definition/select/formats/formats.selector.component';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {FormatsOption} from '../../../../common/dialog/definition/select/formats/FormatsOption';

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
    TranslatePipe,
    NzButtonModule,
    NzRowDirective,
    NzColDirective,
  ],
  providers: [
    NzModalService
  ],
})
export class SpecFormatComponent implements OnInit, OnChanges {

  protected readonly LifeCycle = LifeCycle;

  loading: boolean = true;
  formats: FormatDefinition[] = [];

  // 可添加的格式
  addable: boolean = true;

  codeSortFn: NzTableSortFn<FormatDefinition> = (a: FormatDefinition, b: FormatDefinition): number => a.type.name.localeCompare(b.type.name);

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
    this.service.getFormatDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.formats = data;
          this.addable = this.formats.length < 12;
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected onDelete(format: FormatDefinition) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个格式吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: format.type.toString(),
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
          this.addable = this.formats.length < 12;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected addFormats() {
    const modal = this.modal.create<FormatsSelectorComponent, FormatsOption, FormatDefinition[]>({
      nzTitle: this.i18n.translate.instant('添加格式'),
      nzWidth: 800,
      nzContent: FormatsSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new FormatsOption(new Set(this.formats.map(x => x.type.name))),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: false,
          type: 'primary',
          disabled: component => component!.disabled || false,
          onClick: component => component!.ok()
        }
      ],
      nzClosable: false,
      nzMaskClosable: true,
      nzKeyboard: true
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        if (result.length > 0) {
          this.addFormatDefinitions(result);
        }
      }
    });
  }

  protected addFormatDefinitions(defs: FormatDefinition[]) {
    this.loading = true;
    this.service.createFormatDefinitions(defs)
      .subscribe({
        next: () => {
          console.log('createFormatDefinitions ok');
          this.loading = false;
          this.loadDataFromServer();
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }
}
