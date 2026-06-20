import {Component, Input} from '@angular/core';
import {NzTableModule} from 'ng-zorro-antd/table';
import {RouterLink} from '@angular/router';
import {TemplateSummary} from '@openxiot/xiot-core-spec-ts';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'template-list',
  standalone: true,
  templateUrl: './template.list.component.html',
  styleUrls: ['./template.list.component.less'],
  imports: [
    NzTableModule,
    RouterLink,
    TranslatePipe
  ],
})
export class TemplateListComponent {

  @Input() templates: TemplateSummary[] = [];
}
