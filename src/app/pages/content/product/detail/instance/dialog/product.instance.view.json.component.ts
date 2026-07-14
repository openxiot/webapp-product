import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'product-instance-view-json',
  templateUrl: './product.instance.view.json.component.html',
  styleUrl: './product.instance.view.json.component.less',
  imports: [
    JsonPipe,
  ],
  providers: [],
  standalone: true
})
export class ProductInstanceViewJsonComponent {

  readonly #modal = inject(NzModalRef);
  readonly message: any = inject(NZ_MODAL_DATA);

  constructor() {
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.#modal.destroy(this.message);
  }
}
