import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {DeviceDefinition} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {AccountService} from '../../../../../../../service/account.service';
import {MainI18nService} from '../../../../../../../service/i18n.service';
import {MainService} from '../../../../../../../service/main.service';
import {DevicesOption} from './DevicesOption';

@Component({
  selector: 'device-selector',
  templateUrl: './device.selector.component.html',
  styleUrl: './device.selector.component.less',
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
export class DeviceSelectorComponent {

  readonly #modal = inject(NzModalRef);
  readonly option: DevicesOption = inject(NZ_MODAL_DATA);

  constructor(
    private account: AccountService,
    public i18n: MainI18nService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  protected onDeviceSelected(device: DeviceDefinition): void {
    this.#modal.destroy(device.type);
  }
}
