import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {DeviceDefinition} from '@openxiot/xiot-core-spec-ts';
import {MainI18nService} from '../../../../../../../service/i18n.service';
import {TemplatesOption} from './TemplatesOption';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'template-selector',
  templateUrl: './template.selector.component.html',
  styleUrls: ['./template.selector.component.less'],
  imports: [
    FormsModule,
    NzInputModule,
    NzRowDirective,
    NzColDirective,
    NzCardModule,
    NzIconModule,
    TranslatePipe,
  ],
  providers: [],
  standalone: true
})
export class TemplateSelectorComponent {

  readonly #modal = inject(NzModalRef);
  readonly option: TemplatesOption = inject(NZ_MODAL_DATA);

  constructor(
    public i18n: MainI18nService,
  ) {
  }

  protected onTemplateSelected(device: DeviceDefinition): void {
    this.#modal.destroy(device.type);
  }

  protected onEmptyTemplateSelected() {
    this.#modal.destroy(this.option.deviceType);
  }
}
