import {Component, inject, OnInit, signal} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {AccountService} from '../../../service/account.service';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {MainI18nService} from '../../../service/i18n.service';
import {OrganizationOption} from './OrganizationOption';
import {Organization} from '../../../typedef/define/developer/Organization';

@Component({
  selector: 'organization-selector',
  templateUrl: './organization.selector.component.html',
  styleUrl: './organization.selector.component.less',
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
export class OrganizationSelectorComponent implements OnInit {

  readonly #modal = inject(NzModalRef);
  readonly option: OrganizationOption = inject(NZ_MODAL_DATA);

  loading = signal(false);
  organizations = signal<Organization[]>([]);

  constructor(
    private account: AccountService,
    public i18n: MainI18nService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadOrganizations();
  }

  private loadOrganizations() {
    this.loading.set(true);
    this.service.getAllOrganizations()
      .subscribe({
        next: data => {
          this.organizations.set(data);
          this.loading.set(false);
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected onSelected(org: Organization): void {
    this.#modal.destroy(org);
  }
}
