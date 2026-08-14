import {Component, inject, OnInit, signal} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzTableModule} from 'ng-zorro-antd/table';
import {EventDefinition} from '@openxiot/xiot-core-spec-ts';
import {MainI18nService} from '../../../../../service/i18n.service';
import {NzCardComponent, NzCardMetaComponent} from 'ng-zorro-antd/card';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {MainService} from '../../../../../service/main.service';
import {AccountService} from '../../../../../service/account.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {EventsOption} from './EventsOption';

@Component({
  selector: 'events-definition-selector',
  styleUrl: './events.definition.selector.component.less',
  templateUrl: './events.definition.selector.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzCheckboxModule,
    NzTagModule,
    NzTableModule,
    NzCardComponent,
    NzCardMetaComponent,
    NzIconDirective,
    NzSpinModule,
  ],
  providers: [],
})
export class EventsDefinitionSelectorComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly option: EventsOption = inject(NZ_MODAL_DATA);

  loading = signal(false);
  events = signal<EventDefinition[]>([]);
  selected: Set<string> = new Set<string>();
  disabled = signal(true);

  constructor(
    public i18n: MainI18nService,
    private account: AccountService,
    private main: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit(): void {
    if (this.option.events.length > 0) {
      this.events.set(this.option.events
        .filter(x => ! this.option.exclusion.has(x.type.name)));
    } else {
      this.loadDefinitions();
    }
  }

  private loadDefinitions(): void {
    this.loading.set(true);
    this.main.getEventDefinitions(this.account.ns().namespace).subscribe({
        next: data => {
          this.events.set(data.filter(x => ! this.option.exclusion.has(x.type.name)));
          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      });
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    const list = this.events().filter(x => this.selected.has(x.type.name));
    this.#modal.destroy(list);
  }

  protected select(s: EventDefinition) {
    if (this.selected.has(s.type.name)) {
      this.selected.delete(s.type.name);
    } else {
      this.selected.add(s.type.name);
    }

    this.disabled.set(this.selected.size == 0);
  }
}
