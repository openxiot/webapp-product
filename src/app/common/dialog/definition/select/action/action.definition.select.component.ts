import {Component, inject, OnInit} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActionDefinitionSelector} from './ActionDefinitionSelector';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzCellAlignDirective, NzTableModule} from 'ng-zorro-antd/table';
import {DataFormat, ActionDefinition} from '@openxiot/xiot-core-spec-ts';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../service/i18n.service';

@Component({
  selector: 'action-definition-select',
  styleUrls: ['./action.definition.select.component.less'],
  templateUrl: './action.definition.select.component.html',
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
    TranslatePipe,
  ],
  providers: [],
})
export class ActionDefinitionSelectComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly data: ActionDefinitionSelector = inject(NZ_MODAL_DATA);

  actions: ActionDefinition[] = [];
  selected: Set<ActionDefinition> = new Set<ActionDefinition>();
  checked: boolean = false;
  indeterminate: boolean = false;

  constructor(
    public i18n: MainI18nService,
  ) {
  }

  ngOnInit(): void {
    this.actions = this.data.actions
      .filter(x => ! this.data.exclusion.has(x.type.name));
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.selected);
  }

  onAllChecked(value: boolean): void {
    this.actions.forEach(p => this.updateCheckedSet(p, value));
    this.refreshCheckedStatus();
  }

  onItemChecked(def: ActionDefinition, checked: boolean): void {
    this.updateCheckedSet(def, checked);
    this.refreshCheckedStatus();
  }

  updateCheckedSet(def: ActionDefinition, checked: boolean): void {
    if (checked) {
      this.selected.add(def);
    } else {
      this.selected.delete(def);
    }
  }

  refreshCheckedStatus(): void {
    this.checked = this.actions.every(p => this.selected.has(p));
    this.indeterminate = this.actions.some(p => this.selected.has(p)) && !this.checked;
  }

  protected readonly DataFormat = DataFormat;
}
