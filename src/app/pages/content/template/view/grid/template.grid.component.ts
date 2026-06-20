import {Component, Input} from '@angular/core';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {RouterLink} from '@angular/router';
import {TemplateSummary} from '@openxiot/xiot-core-spec-ts';
import {MainI18nService} from '../../../../../service/i18n.service';

@Component({
  selector: 'template-grid',
  standalone: true,
  templateUrl: './template.grid.component.html',
  styleUrls: ['./template.grid.component.less'],
  imports: [
    NzRowDirective,
    NzColDirective,
    NzCardModule,
    RouterLink,
  ],
})
export class TemplateGridComponent {

  @Input() templates: TemplateSummary[] = [];

  constructor(
    public i18n: MainI18nService,
  ) {
  }
}
