import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {AccountService} from '../../../service/account.service';
import {FormatDefinition, FormatType, LifeCycle, Spec, UrnType} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {MainI18nService} from '../../../service/i18n.service';

@Component({
  selector: 'app-format-selector',
  templateUrl: './format.selector.component.html',
  styleUrls: ['./format.selector.component.less'],
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
export class FormatSelectorComponent {

  readonly #modal = inject(NzModalRef);
  readonly message: string = inject(NZ_MODAL_DATA);

  loading: boolean = false;
  formatExist: Set<string> = new Set();

  formats: FormatDefinition[] = [];
  formatSelected: Set<string> = new Set();

  disabled: boolean = true;

  constructor(
    public account: AccountService,
    public i18n: MainI18nService,
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.initDefaultFormats();
    this.loadDataFromServer();
  }

  private initDefaultFormats() {
    this.formats.push(this.createFormat('string', 'string', '字符串'));
    this.formats.push(this.createFormat('bool', 'bool', '布尔'));
    this.formats.push(this.createFormat('uint8', 'unsinged 8 bits integer', '无符号8位整型'));
    this.formats.push(this.createFormat('uint16', 'unsinged 16 bits integer', '无符号16位整型'));
    this.formats.push(this.createFormat('uint32', 'unsinged 32 bits integer', '无符号32位整型'));
    this.formats.push(this.createFormat('int8', 'singed 8 bits integer', '有符号8位整型'));
    this.formats.push(this.createFormat('int16', 'singed 16 bits integer', '有符号16位整型'));
    this.formats.push(this.createFormat('int32', 'singed 32 bits integer', '有符号32位整型'));
    this.formats.push(this.createFormat('int64', 'singed 64 bits integer', '有符号64位整型'));
    this.formats.push(this.createFormat('float', 'float', '浮点数'));
    this.formats.push(this.createFormat('hex', 'hex', '16进制字符串'));
    this.formats.push(this.createFormat('combination', 'combination', '组合'));
  }

  loadDataFromServer(): void {
    this.loading = true;
    this.service.getFormatDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.formatExist = new Set(data.map(x => x.type.name));
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  private createFormat(code: string, descriptionENUS: string, descriptionZHCN: string): FormatDefinition {
    const type = FormatType.create(this.account.ns.namespace, UrnType.FORMAT, code, '0000');
    const descriptions = new Map<string, string>();
    descriptions.set(Spec.EN_US, descriptionENUS);
    descriptions.set(Spec.ZH_CN, descriptionZHCN);
    const def = new FormatDefinition(type, descriptions);
    def.lifecycle = LifeCycle.DEVELOPMENT;
    return def;
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    const list = this.formats.filter(x => this.formatSelected.has(x.type.name));
    this.#modal.destroy(list);
  }

  protected select(format: FormatDefinition): void {
    if (this.formatSelected.has(format.type.name)) {
      this.formatSelected.delete(format.type.name);
    } else {
      this.formatSelected.add(format.type.name);
    }

    this.disabled = this.formatSelected.size == 0;
  }
}
