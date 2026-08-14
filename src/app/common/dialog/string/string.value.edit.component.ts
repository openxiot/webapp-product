import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {StringValue} from './StringValue';

@Component({
  selector: 'string-value-edit',
  templateUrl: './string.value.edit.component.html',
  styleUrl: './string.value.edit.component.less',
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

  /**
   * footer「确认」按钮的 disabled 回调会调用 `component!.changed()`。
   * Zoneless 下该回调在 footer 模板求值时执行，读这个 computed signal 会被 footer 的
   * 响应式 consumer 跟踪 —— 输入变化即自动刷新按钮状态，无需手动标脏 footer。
   */
  readonly changed = this.s.changed;

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.s.newValue());
  }
}
