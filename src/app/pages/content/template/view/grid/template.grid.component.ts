import {Component, Input} from '@angular/core';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {RouterLink} from '@angular/router';
import {TemplateSummary} from '@openxiot/xiot-core-spec-ts';
import {TranslatePipe} from '@ngx-translate/core';

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
    TranslatePipe,
  ],
})
export class TemplateGridComponent {

  @Input() templates: TemplateSummary[] = [];
}
