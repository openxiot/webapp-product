import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {LangOption} from './LangOption';
import {MainI18nService} from '../../../../service/i18n.service';
import {TranslatePipe} from '@ngx-translate/core';
import {NzCardComponent, NzCardMetaComponent} from 'ng-zorro-antd/card';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzIconDirective} from 'ng-zorro-antd/icon';

@Component({
  selector: 'language-add',
  templateUrl: './language.add.component.html',
  standalone: true,
  imports: [
    NzSpaceModule,
    NzTagModule,
    TranslatePipe,
    NzCardComponent,
    NzCardMetaComponent,
    NzColDirective,
    NzIconDirective,
    NzRowDirective
  ]
})
export class LanguageAddComponent {

  readonly modalRef = inject(NzModalRef);
  readonly usedLangs = inject<{ lang: string }[]>(NZ_MODAL_DATA);
  readonly i18n = inject(MainI18nService);

  // 从 i18n 服务动态生成全部 66 种语言
  get allLanguages(): LangOption[] {
    return this.i18n.languages.map(l => ({
      lang: l.bcp47,
      label: l.name,
    }));
  }

  // 多选选中的语言
  selectedSet = new Set<string>();

  // 未添加的语言
  get availableLanguages(): LangOption[] {
    const used = new Set(this.usedLangs.map(item => item.lang));
    return this.allLanguages.filter(l => !used.has(l.lang));
  }

  // 切换选中
  toggleLang(lang: string): void {
    if (this.selectedSet.has(lang)) {
      this.selectedSet.delete(lang);
    } else {
      this.selectedSet.add(lang);
    }
  }

  isSelected(lang: string): boolean {
    return this.selectedSet.has(lang);
  }

  cancel(): void {
    this.modalRef.close(undefined);
  }

  ok(): void {
    const selected = this.allLanguages.filter(l => this.selectedSet.has(l.lang));
    this.modalRef.close(selected); // 返回数组
  }
}
