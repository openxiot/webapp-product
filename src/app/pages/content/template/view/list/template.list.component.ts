import {Component, Input} from '@angular/core';
import {NzTableModule} from 'ng-zorro-antd/table';
import {RouterLink} from '@angular/router';
import {Template} from '../../../../../typedef/define/template/Template';

@Component({
  selector: 'template-list',
  standalone: true,
  templateUrl: './template.list.component.html',
  styleUrls: ['./template.list.component.less'],
  imports: [
    NzTableModule,
    RouterLink
  ],
})
export class TemplateListComponent {

  @Input() templates: Template[] = [];
}
