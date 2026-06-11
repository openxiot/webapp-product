import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {Type} from '../../../../../typedef/define/Type';

@Component({
  selector: 'template-filter-type',
  standalone: true,
  templateUrl: './template.filter.type.component.html',
  styleUrls: ['./template.filter.type.component.less'],
  imports: [
    NzCardModule,
    NzTagComponent,
  ],
})
export class TemplateFilterTypeComponent {

  @Input() types: Type[] = [];
  @Output() typeSelected: EventEmitter<Set<string>> = new EventEmitter();

  all: Type = new Type('all', '所有类型');

  onAllChecked(type: Type, checked: boolean) {
    this.types.forEach(x => x.checked = checked);
    this.typeSelected.emit(this.getSelectedTypes());
  }

  onTypeChecked(type: Type, checked: boolean) {

    let checkedCount = 0;
    for (let x of this.types) {
      checkedCount += x.checked ? 1 : 0;
    }

    this.all.checked = checkedCount === this.types.length;
    this.typeSelected.emit(this.getSelectedTypes());
  }

  private getSelectedTypes(): Set<string> {
    return new Set(this.types.filter(x => x.checked).map(x => x.code));
  }
}
