import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {LangOption} from './LangOption';


@Component({
  selector: 'language-selector',
  templateUrl: './language.selector.component.html',
  standalone: true,
  imports: [
    NzSpaceModule,
    NzTagModule
  ]
})
export class LanguageSelectorComponent {

  readonly modalRef = inject(NzModalRef);
  readonly usedLangs = inject<{ lang: string }[]>(NZ_MODAL_DATA);

  allLanguages: LangOption[] = [
    {lang: 'zh-CN', label: '简体中文'},
    {lang: 'zh-TW', label: '繁体中文'},
    {lang: 'ja-JP', label: '日语'},
    {lang: 'ko-KR', label: '韩语'},
    {lang: 'fr-FR', label: '法语'},
    {lang: 'de-DE', label: '德语'},
    {lang: 'es-ES', label: '西班牙语'},
    {lang: 'ru-RU', label: '俄语'},
  ];

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
