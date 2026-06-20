import {Component, inject, OnInit} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {EventDefinitionSelector} from './EventDefinitionSelector';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzCellAlignDirective, NzTableModule} from 'ng-zorro-antd/table';
import {DataFormat, EventDefinition} from '@openxiot/xiot-core-spec-ts';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'event-definition-select',
  styleUrls: ['./event.definition.select.component.less'],
  templateUrl: './event.definition.select.component.html',
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
export class EventDefinitionSelectComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly data: EventDefinitionSelector = inject(NZ_MODAL_DATA);

  events: EventDefinition[] = [];
  selected: Set<EventDefinition> = new Set<EventDefinition>();
  checked: boolean = false;
  indeterminate: boolean = false;

  constructor(
  ) {
  }

  ngOnInit(): void {
    this.events = this.data.events
      .filter(x => ! this.data.exclusion.has(x.type.name));
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.selected);
  }

  onAllChecked(value: boolean): void {
    this.events.forEach(p => this.updateCheckedSet(p, value));
    this.refreshCheckedStatus();
  }

  onItemChecked(def: EventDefinition, checked: boolean): void {
    this.updateCheckedSet(def, checked);
    this.refreshCheckedStatus();
  }

  updateCheckedSet(def: EventDefinition, checked: boolean): void {
    if (checked) {
      this.selected.add(def);
    } else {
      this.selected.delete(def);
    }
  }

  refreshCheckedStatus(): void {
    this.checked = this.events.every(p => this.selected.has(p));
    this.indeterminate = this.events.some(p => this.selected.has(p)) && !this.checked;
  }

  protected readonly DataFormat = DataFormat;
}
