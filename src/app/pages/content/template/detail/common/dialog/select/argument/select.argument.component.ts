import {Component, inject, OnInit} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectArgument} from './SelectArgument';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzCellAlignDirective, NzTableModule} from 'ng-zorro-antd/table';
import {PropertyMemberComponent} from '../../../../sider/service/waterfall/tables/properties/member/property-member.component';
import {Property, PropertyTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'select-argument',
  styleUrls: ['./select.argument.component.less'],
  templateUrl: './select.argument.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzTagModule,
    NzCellAlignDirective,
    NzTableModule,
    NzRadioModule,
    PropertyMemberComponent,
    TranslatePipe,
  ],
  providers: [],
})
export class SelectArgumentComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly data: SelectArgument = inject(NZ_MODAL_DATA);

  properties: PropertyTemplate[] = [];

  selected: Set<number> = new Set<number>();
  checked: boolean = false;
  indeterminate: boolean = false;

  constructor(
  ) {
  }

  ngOnInit(): void {
    this.properties = this.data.service.getProperties()
      .filter(x => ! this.data.exclusion.has(x.iid));
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.selected);
  }

  onAllChecked(value: boolean): void {
    this.properties.forEach(p => this.updateCheckedSet(p.iid, value));
    this.refreshCheckedStatus();
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  updateCheckedSet(iid: number, checked: boolean): void {
    if (checked) {
      this.selected.add(iid);
    } else {
      this.selected.delete(iid);
    }
  }

  refreshCheckedStatus(): void {
    this.checked = this.properties.every(p => this.selected.has(p.iid));
    this.indeterminate = this.properties.some(p => this.selected.has(p.iid)) && !this.checked;
  }
}
