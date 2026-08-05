import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {FormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {AccountService} from '../../../../../service/account.service';
import {FormatDefinition, FormatType, LifeCycle, UrnType} from '@openxiot/xiot-core-spec-ts';
import {MainI18nService} from '../../../../../service/i18n.service';
import {FormatsOption} from './FormatsOption';

@Component({
  selector: 'app-formats-selector',
  templateUrl: './formats.selector.component.html',
  styleUrl: './formats.selector.component.less',
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
export class FormatsSelectorComponent {

  readonly #modal = inject(NzModalRef);
  readonly option: FormatsOption = inject(NZ_MODAL_DATA);

  formats: FormatDefinition[] = [];
  selected: Set<string> = new Set();
  disabled: boolean = true;

  constructor(
    public account: AccountService,
    public i18n: MainI18nService,
  ) {
  }

  ngOnInit() {
    this.initDefaultFormats();
  }

  private initDefaultFormats() {
    this.formats.push(this.createFormatString());
    this.formats.push(this.createFormatBool());
    this.formats.push(this.createFormatUint8());
    this.formats.push(this.createFormatUint16());
    this.formats.push(this.createFormatUint32());
    this.formats.push(this.createFormatInt8());
    this.formats.push(this.createFormatInt16());
    this.formats.push(this.createFormatInt32());
    this.formats.push(this.createFormatInt64());
    this.formats.push(this.createFormatFloat());
    this.formats.push(this.createFormatHex());
    this.formats.push(this.createFormatCombination());
  }

  /** Helper to populate a Map with all 12 locale entries from a plain record. */
  private setDescriptions(map: Map<string, string>, labels: Record<string, string>): void {
    for (const [lang, label] of Object.entries(labels)) {
      map.set(lang, label);
    }
  }

  private createFormatString(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "string",
      'zh-CN': "字符串",
      'zh-TW': "字串",
      'de-DE': "Zeichenkette",
      'fr-FR': "chaîne",
      'it-IT': "stringa",
      'ru-RU': "строка",
      'ko-KR': "문자열",
      'es-ES': "cadena",
      'ja-JP': "文字列",
      'nl-NL': "tekenreeks",
      'pt-PT': "cadeia",
    });
    return this.createFormat('string', descriptions);
  }

  private createFormatBool(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "bool",
      'zh-CN': "布尔",
      'zh-TW': "布林",
      'de-DE': "Boolesch",
      'fr-FR': "booléen",
      'it-IT': "booleano",
      'ru-RU': "булев",
      'ko-KR': "불리언",
      'es-ES': "booleano",
      'ja-JP': "ブール",
      'nl-NL': "booleaans",
      'pt-PT': "booleano",
    });
    return this.createFormat('bool', descriptions);
  }

  private createFormatUint8(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "unsigned 8-bit integer",
      'zh-CN': "无符号8位整型",
      'zh-TW': "無符號8位元整數",
      'de-DE': "vorzeichenlose 8-Bit-Ganzzahl",
      'fr-FR': "entier 8 bits non signé",
      'it-IT': "intero 8 bit senza segno",
      'ru-RU': "8-битное целое без знака",
      'ko-KR': "부호 없는 8비트 정수",
      'es-ES': "entero de 8 bits sin signo",
      'ja-JP': "8ビット符号なし整数",
      'nl-NL': "8-bits integer zonder teken",
      'pt-PT': "inteiro de 8 bits sem sinal",
    });
    return this.createFormat('uint8', descriptions);
  }

  private createFormatUint16(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "unsigned 16-bit integer",
      'zh-CN': "无符号16位整型",
      'zh-TW': "無符號16位元整數",
      'de-DE': "vorzeichenlose 16-Bit-Ganzzahl",
      'fr-FR': "entier 16 bits non signé",
      'it-IT': "intero 16 bit senza segno",
      'ru-RU': "16-битное целое без знака",
      'ko-KR': "부호 없는 16비트 정수",
      'es-ES': "entero de 16 bits sin signo",
      'ja-JP': "16ビット符号なし整数",
      'nl-NL': "16-bits integer zonder teken",
      'pt-PT': "inteiro de 16 bits sem sinal",
    });
    return this.createFormat('uint16', descriptions);
  }

  private createFormatUint32(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "unsigned 32-bit integer",
      'zh-CN': "无符号32位整型",
      'zh-TW': "無符號32位元整數",
      'de-DE': "vorzeichenlose 32-Bit-Ganzzahl",
      'fr-FR': "entier 32 bits non signé",
      'it-IT': "intero 32 bit senza segno",
      'ru-RU': "32-битное целое без знака",
      'ko-KR': "부호 없는 32비트 정수",
      'es-ES': "entero de 32 bits sin signo",
      'ja-JP': "32ビット符号なし整数",
      'nl-NL': "32-bits integer zonder teken",
      'pt-PT': "inteiro de 32 bits sem sinal",
    });
    return this.createFormat('uint32', descriptions);
  }

  private createFormatInt8(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "signed 8-bit integer",
      'zh-CN': "有符号8位整型",
      'zh-TW': "有符號8位元整數",
      'de-DE': "vorzeichenbehaftete 8-Bit-Ganzzahl",
      'fr-FR': "entier 8 bits signé",
      'it-IT': "intero 8 bit con segno",
      'ru-RU': "8-битное целое со знаком",
      'ko-KR': "부호 있는 8비트 정수",
      'es-ES': "entero de 8 bits con signo",
      'ja-JP': "8ビット符号あり整数",
      'nl-NL': "8-bits integer met teken",
      'pt-PT': "inteiro de 8 bits com sinal",
    });
    return this.createFormat('int8', descriptions);
  }

  private createFormatInt16(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "signed 16-bit integer",
      'zh-CN': "有符号16位整型",
      'zh-TW': "有符號16位元整數",
      'de-DE': "vorzeichenbehaftete 16-Bit-Ganzzahl",
      'fr-FR': "entier 16 bits signé",
      'it-IT': "intero 16 bit con segno",
      'ru-RU': "16-битное целое со знаком",
      'ko-KR': "부호 있는 16비트 정수",
      'es-ES': "entero de 16 bits con signo",
      'ja-JP': "16ビット符号あり整数",
      'nl-NL': "16-bits integer met teken",
      'pt-PT': "inteiro de 16 bits com sinal",
    });
    return this.createFormat('int16', descriptions);
  }

  private createFormatInt32(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "signed 32-bit integer",
      'zh-CN': "有符号32位整型",
      'zh-TW': "有符號32位元整數",
      'de-DE': "vorzeichenbehaftete 32-Bit-Ganzzahl",
      'fr-FR': "entier 32 bits signé",
      'it-IT': "intero 32 bit con segno",
      'ru-RU': "32-битное целое со знаком",
      'ko-KR': "부호 있는 32비트 정수",
      'es-ES': "entero de 32 bits con signo",
      'ja-JP': "32ビット符号あり整数",
      'nl-NL': "32-bits integer met teken",
      'pt-PT': "inteiro de 32 bits com sinal",
    });
    return this.createFormat('int32', descriptions);
  }

  private createFormatInt64(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "signed 64-bit integer",
      'zh-CN': "有符号64位整型",
      'zh-TW': "有符號64位元整數",
      'de-DE': "vorzeichenbehaftete 64-Bit-Ganzzahl",
      'fr-FR': "entier 64 bits signé",
      'it-IT': "intero 64 bit con segno",
      'ru-RU': "64-битное целое со знаком",
      'ko-KR': "부호 있는 64비트 정수",
      'es-ES': "entero de 64 bits con signo",
      'ja-JP': "64ビット符号あり整数",
      'nl-NL': "64-bits integer met teken",
      'pt-PT': "inteiro de 64 bits com sinal",
    });
    return this.createFormat('int64', descriptions);
  }

  private createFormatFloat(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "float",
      'zh-CN': "浮点数",
      'zh-TW': "浮點數",
      'de-DE': "Gleitkommazahl",
      'fr-FR': "flottant",
      'it-IT': "virgola mobile",
      'ru-RU': "число с плавающей точкой",
      'ko-KR': "부동소수점",
      'es-ES': "flotante",
      'ja-JP': "浮動小数点数",
      'nl-NL': "zwevendekommagetal",
      'pt-PT': "ponto flutuante",
    });
    return this.createFormat('float', descriptions);
  }

  private createFormatHex(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "hex",
      'zh-CN': "16进制字符串",
      'zh-TW': "16進位字串",
      'de-DE': "Hexadezimal",
      'fr-FR': "hexadécimal",
      'it-IT': "esadecimale",
      'ru-RU': "шестнадцатеричный",
      'ko-KR': "16진수 문자열",
      'es-ES': "hexadecimal",
      'ja-JP': "16進数文字列",
      'nl-NL': "hexadecimaal",
      'pt-PT': "hexadecimal",
    });
    return this.createFormat('hex', descriptions);
  }

  private createFormatCombination(): FormatDefinition {
    const descriptions = new Map<string, string>();
    this.setDescriptions(descriptions, {
      'en-US': "combination",
      'zh-CN': "组合",
      'zh-TW': "組合",
      'de-DE': "Kombination",
      'fr-FR': "combinaison",
      'it-IT': "combinazione",
      'ru-RU': "комбинация",
      'ko-KR': "조합",
      'es-ES': "combinación",
      'ja-JP': "組み合わせ",
      'nl-NL': "combinatie",
      'pt-PT': "combinação",
    });
    return this.createFormat('combination', descriptions);
  }

  private createFormat(code: string, descriptions: Map<string, string>): FormatDefinition {
    const type = FormatType.create(this.account.ns().namespace, UrnType.FORMAT, code, '0000');
    const def = new FormatDefinition(type, descriptions);
    def.lifecycle = LifeCycle.RELEASED;
    return def;
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    const list = this.formats.filter(x => this.selected.has(x.type.name));
    this.#modal.destroy(list);
  }

  protected select(format: FormatDefinition): void {
    if (this.selected.has(format.type.name)) {
      this.selected.delete(format.type.name);
    } else {
      this.selected.add(format.type.name);
    }

    this.disabled = this.selected.size == 0;
  }
}
