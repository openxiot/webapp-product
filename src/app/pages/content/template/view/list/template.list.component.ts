import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NzTableModule} from 'ng-zorro-antd/table';
import {RouterLink} from '@angular/router';
import {LifeCycle, TemplateSummary} from '@openxiot/xiot-core-spec-ts';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../service/i18n.service';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {AccountService} from '../../../../../service/account.service';

@Component({
  selector: 'template-list',
  standalone: true,
  templateUrl: './template.list.component.html',
  styleUrls: ['./template.list.component.less'],
  imports: [
    NzTableModule,
    RouterLink,
    TranslatePipe,
    NzTagComponent,
    NzDividerComponent
  ],
})
export class TemplateListComponent {

  protected readonly LifeCycle = LifeCycle;

  @Input() templates: TemplateSummary[] = [];
  @Output() removed = new EventEmitter<string>();

  constructor(
    public account: AccountService,
    public i18n: MainI18nService,
  ) {
  }

  protected onDelete(t: TemplateSummary) {
    this.removed.emit(t.type.toString())
  }
}
