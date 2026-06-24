import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {StringValue} from './StringValue';

@Component({
  selector: 'string-value-edit',
  templateUrl: './string.value.edit.component.html',
  styleUrls: ['./string.value.edit.component.less'],
  standalone: true,
  imports: [
    FormsModule,
    NzInputModule,
  ],
  providers: [],
})
export class StringValueEditComponent {

  readonly #modal = inject(NzModalRef);
  readonly s: StringValue = inject(NZ_MODAL_DATA);

  changed: boolean = false;

  constructor() {
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.s.newValue);
  }

  protected onChange($event: any) {
    this.changed = this.s.changed();
  }
}
