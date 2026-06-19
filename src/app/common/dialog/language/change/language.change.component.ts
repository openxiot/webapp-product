import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {MainI18nService} from '../../../../service/i18n.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-language-change',
  templateUrl: './language.change.component.html',
  styleUrls: ['./language.change.component.less'],
  imports: [
    FormsModule,
    NzInputModule,
    NzRowDirective,
    NzColDirective,
    NzCardModule,
    NzIconModule,
  ],
  providers: [],
  standalone: true
})
export class LanguageChangeComponent {

  readonly #modal = inject(NzModalRef);
  readonly message: string = inject(NZ_MODAL_DATA);

  constructor(
    public i18n: MainI18nService,
  ) {
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(undefined);
  }

  protected changeLanguage(code: string): void {
    this.i18n.changeLanguage(code)
    this.ok();
  }
}
