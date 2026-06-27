import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {AccountService} from '../../../service/account.service';
import {NamespaceDefinition} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {MainI18nService} from '../../../service/i18n.service';

@Component({
  selector: 'namespace-selector',
  templateUrl: './namespace.selector.component.html',
  styleUrls: ['./namespace.selector.component.less'],
  imports: [
    FormsModule,
    NzInputModule,
    NzRowDirective,
    NzColDirective,
    NzCardModule,
    NzIconModule,
    NzSpinComponent,
  ],
  providers: [],
  standalone: true
})
export class NamespaceSelectorComponent {

  readonly #modal = inject(NzModalRef);
  readonly currentNamespace: string = inject(NZ_MODAL_DATA);

  loading: boolean = true;
  namespaces: NamespaceDefinition[] = [];

  constructor(
    private account: AccountService,
    public i18n: MainI18nService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadNamespaces();
  }

  private loadNamespaces() {
    this.service.getAllNamespaces(this.account.organization)
      .subscribe({
        next: data => {
          this.namespaces = data;
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected onSelected(ns: NamespaceDefinition): void {
    this.#modal.destroy(ns);
  }
}
