import {Component, inject, OnInit} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ServicesOption} from './ServicesOption';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzTableModule} from 'ng-zorro-antd/table';
import {ServiceDefinition} from '@openxiot/xiot-core-spec-ts';
import {MainI18nService} from '../../../../../service/i18n.service';
import {NzCardComponent, NzCardMetaComponent} from 'ng-zorro-antd/card';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {MainService} from '../../../../../service/main.service';
import {AccountService} from '../../../../../service/account.service';
import {NzMessageService} from 'ng-zorro-antd/message';

@Component({
  selector: 'services-definition-selector',
  styleUrl: './services.definition.selector.component.less',
  templateUrl: './services.definition.selector.component.html',
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
export class ServicesDefinitionSelectorComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly option: ServicesOption = inject(NZ_MODAL_DATA);

  loading: boolean = false;
  services: ServiceDefinition[] = [];
  selected: Set<string> = new Set<string>();
  disabled: boolean = true;

  constructor(
    public i18n: MainI18nService,
    private account: AccountService,
    private main: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit(): void {
    if (this.option.services.length > 0) {
      this.services = this.option.services
        .filter(x => ! this.option.exclusion.has(x.type.name));
    } else {
      this.loadDefinitions();
    }
  }

  private loadDefinitions(): void {
    this.loading = true;
    this.main.getServiceDefinitions(this.account.ns.namespace).subscribe({
        next: data => {
          this.services = data.filter(x => ! this.option.exclusion.has(x.type.name));
          this.loading = false;
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
    const list = this.services.filter(x => this.selected.has(x.type.name));
    this.#modal.destroy(list);
  }

  protected select(s: ServiceDefinition) {
    if (this.selected.has(s.type.name)) {
      this.selected.delete(s.type.name);
    } else {
      this.selected.add(s.type.name);
    }

    this.disabled = this.selected.size == 0;
  }
}
