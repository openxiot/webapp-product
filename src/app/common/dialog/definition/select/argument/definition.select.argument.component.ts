import {Component, inject, OnInit} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DefinitionSelectArgument} from './DefinitionSelectArgument';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzCellAlignDirective, NzTableModule} from 'ng-zorro-antd/table';
import {DataFormat, PropertyDefinition} from '@openxiot/xiot-core-spec-ts';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {PropertyDefinitionMembersComponent} from '../../../../form/item/property/def/members/property.definition.members.component';

@Component({
  selector: 'definition-select-argument',
  styleUrls: ['./definition.select.argument.component.less'],
  templateUrl: './definition.select.argument.component.html',
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
    PropertyDefinitionMembersComponent,
  ],
  providers: [],
})
export class DefinitionSelectArgumentComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly data: DefinitionSelectArgument = inject(NZ_MODAL_DATA);

  properties: PropertyDefinition[] = [];

  selected: Set<PropertyDefinition> = new Set<PropertyDefinition>();
  checked: boolean = false;
  indeterminate: boolean = false;

  constructor(
  ) {
  }

  ngOnInit(): void {
    this.properties = this.data.properties
      .filter(x => ! this.data.exclusion.has(x.type.name));
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.selected);
  }

  onAllChecked(value: boolean): void {
    this.properties.forEach(p => this.updateCheckedSet(p, value));
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
