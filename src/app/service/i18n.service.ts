import {inject, Injectable, signal} from "@angular/core";
import {
  NzI18nInterface,
  NzI18nService,
  zh_CN,
  en_US,
  ja_JP,
  de_DE,
  es_ES,
  fr_FR,
  it_IT,
  ko_KR,
  ru_RU,
  nl_NL,
  pt_PT
} from "ng-zorro-antd/i18n";
import {TranslateService} from "@ngx-translate/core";

// 支持的语言映射
export const SUPPORTED_LANGUAGES: Record<string, { name: string; nzLocale: NzI18nInterface }> = {
  en: {
    name: 'English',
    nzLocale: en_US
  },
  zh: {
    name: '中文',
    nzLocale: zh_CN
  },
  de: {
    name: 'Deutsch',
    nzLocale: de_DE
  },
  fr: {
    name: 'Français',
    nzLocale: fr_FR
  },
  it: {
    name: 'Italiano',
    nzLocale: it_IT
  },
  ru: {
    name: "Русский",
    nzLocale: ru_RU
  },
  ko: {
    name: "한국어",
    nzLocale: ko_KR
  },
  es: {
    name: 'Español',
    nzLocale: es_ES
  },
  ja: {
    name: '日本語',
    nzLocale: ja_JP
  },
  nl: {
    name: "Nederlands",
    nzLocale: nl_NL
  },
  pt: {
    name: 'Português',
    nzLocale: pt_PT,
  }
};

@Injectable({providedIn: 'root'})
export class MainI18nService {

  public translate = inject(TranslateService);
  public i18n = inject(NzI18nService);

  languages = Object.entries(SUPPORTED_LANGUAGES)
    .map(
      ([code, config]) => (
        {
          code: code,
          name: config.name
        }
      )
    );

  currentLang = signal<string>('en');

  constructor() {
    // 读保存的语言设置
    const savedLang = localStorage.getItem('lang');
    console.log('savedLang: ', savedLang);

    // 读浏览器使用的语言（如果浏览器语言取不到，则用英文）
    const browserLang = this.translate.getBrowserLang() || 'en';
    console.log('browserLang: ', browserLang);

    // 如果有保存的语言，使用保存的语言，否则用浏览器的语言
    const langToUse = savedLang && SUPPORTED_LANGUAGES[savedLang] ? savedLang : browserLang;

    this.currentLang.set(langToUse);
    this.translate.use(langToUse);
    this.setNzI18n(langToUse);
  }

  changeLanguage(lang: string) {
    console.log(`Language changed to: ${lang}`);

    if (!SUPPORTED_LANGUAGES[lang]) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }

    localStorage.setItem('lang', lang);
    this.currentLang.set(lang);
    this.translate.use(lang);
    this.setNzI18n(lang);
  }

  private setNzI18n(lang: string): void {
    const nzLocale = SUPPORTED_LANGUAGES[lang]?.nzLocale;
    if (nzLocale) {
      this.i18n.setLocale(nzLocale);
    }
  }

  getCurrentLang() {
    // return this.currentLang.asReadonly();
    return this.i18n.getLocale().locale;
  }
}
