import {Component, inject, OnInit} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DefinitionSelectMember} from './DefinitionSelectMember';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzCellAlignDirective, NzTableModule} from 'ng-zorro-antd/table';
import {DataFormat, PropertyDefinition} from '@openxiot/xiot-core-spec-ts';

@Component({
  selector: 'definition-select-member',
  styleUrls: ['./definition.select.member.component.less'],
  templateUrl: './definition.select.member.component.html',
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
  ],
  providers: [],
})
export class DefinitionSelectMemberComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly data: DefinitionSelectMember = inject(NZ_MODAL_DATA);

  loading: boolean = false;

  selected: Set<PropertyDefinition> = new Set<PropertyDefinition>();
  checked: boolean = false;
  indeterminate: boolean = false;

  constructor(
  ) {
  }

  ngOnInit(): void {
    this.selected = new Set(this.data.members);
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.selected);
  }

  onAllChecked(value: boolean): void {
    this.data.properties.forEach(p => this.updateCheckedSet(p, value));
    this.refreshCheckedStatus();
  }

  onItemChecked(def: PropertyDefinition, checked: boolean): void {
    this.updateCheckedSet(def, checked);
    this.refreshCheckedStatus();
  }

  updateCheckedSet(def: PropertyDefinition, checked: boolean): void {
    if (checked) {
      this.selected.add(def);
    } else {
      this.selected.delete(def);
    }
  }

  refreshCheckedStatus(): void {
    this.checked = this.data.properties.every(p => this.selected.has(p));
    this.indeterminate = this.data.properties.some(p => this.selected.has(p)) && !this.checked;
  }

  protected readonly DataFormat = DataFormat;
}
