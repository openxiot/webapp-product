import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {EditableString} from './EditableString';
import {NzInputModule} from 'ng-zorro-antd/input';

@Component({
  selector: 'edit-string',
  templateUrl: './edit.string.component.html',
  styleUrls: ['./edit.string.component.less'],
  imports: [
    FormsModule,
    NzInputModule,
  ],
  providers: [],
  standalone: true
})
export class EditStringComponent {

  readonly #modal = inject(NzModalRef);
  readonly data: EditableString = inject(NZ_MODAL_DATA);
  disabled: boolean = true;

  constructor(
  ) {
  }

  onChanged() {
    this.disabled = false;
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.data.value);
  }
}
