import { inject, Injectable, signal } from "@angular/core";
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
import { TranslateService } from "@ngx-translate/core";

// 支持的语言映射 → 这里加上标准 BCP 47 码
export const SUPPORTED_LANGUAGES: Record<string, { name: string; nzLocale: NzI18nInterface; bcp47: string }> = {
  en: {
    name: 'English',
    nzLocale: en_US,
    bcp47: 'en-US'
  },
  zh: {
    name: '中文',
    nzLocale: zh_CN,
    bcp47: 'zh-CN'
  },
  de: {
    name: 'Deutsch',
    nzLocale: de_DE,
    bcp47: 'de-DE'
  },
  fr: {
    name: 'Français',
    nzLocale: fr_FR,
    bcp47: 'fr-FR'
  },
  it: {
    name: 'Italiano',
    nzLocale: it_IT,
    bcp47: 'it-IT'
  },
  ru: {
    name: "Русский",
    nzLocale: ru_RU,
    bcp47: 'ru-RU'
  },
  ko: {
    name: "한국어",
    nzLocale: ko_KR,
    bcp47: 'ko-KR'
  },
  es: {
    name: 'Español',
    nzLocale: es_ES,
    bcp47: 'es-ES'
  },
  ja: {
    name: '日本語',
    nzLocale: ja_JP,
    bcp47: 'ja-JP'
  },
  nl: {
    name: "Nederlands",
    nzLocale: nl_NL,
    bcp47: 'nl-NL'
  },
  pt: {
    name: 'Português',
    nzLocale: pt_PT,
    bcp47: 'pt-PT'
  }
};

@Injectable({ providedIn: 'root' })
export class MainI18nService {

  public translate = inject(TranslateService);
  public i18n = inject(NzI18nService);

  languages = Object.entries(SUPPORTED_LANGUAGES)
    .map(([code, config]) => ({
      code: code,
      name: config.name,
      bcp47: config.bcp47,
    }));

  currentLang = signal<string>('en');

  constructor() {
    const savedLang = localStorage.getItem('lang');
    const browserLang = this.translate.getBrowserLang() || 'en';
    const langToUse = savedLang && SUPPORTED_LANGUAGES[savedLang] ? savedLang : browserLang;

    this.currentLang.set(langToUse);
    this.translate.use(langToUse);
    this.setNzI18n(langToUse);
  }

  changeLanguage(lang: string) {
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

  // ✅ 直接返回 BCP 47 格式
  getCurrentLang(): string {
    const langCode = this.currentLang();
    return SUPPORTED_LANGUAGES[langCode]?.bcp47 ?? 'en-US';
  }
}
