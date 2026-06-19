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

@Component({
  selector: 'app-namespace-change',
  templateUrl: './namespace.change.component.html',
  styleUrls: ['./namespace.change.component.less'],
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
export class NamespaceChangeComponent {

  readonly #modal = inject(NzModalRef);
  readonly message: string = inject(NZ_MODAL_DATA);

  loading: boolean = true;
  namespaces: NamespaceDefinition[] = [];

  constructor(
    public account: AccountService,
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

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(undefined);
  }

  protected changeNamespace(ns: NamespaceDefinition): void {
    this.account.ns = ns;
    this.#modal.destroy(ns);
  }
}
