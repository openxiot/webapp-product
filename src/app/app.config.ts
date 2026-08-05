import {ApplicationConfig, provideZonelessChangeDetection} from '@angular/core';
import {provideRouter, withHashLocation} from '@angular/router';

import {routes} from './app.routes';
import {icons} from './icons-provider';
import {provideNzIcons} from 'ng-zorro-antd/icon';
import {zh_CN, provideNzI18n} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {OxHttpInterceptor} from "./service/interceptors/OxHttpInterceptor";
import {JwtInterceptor} from "./service/interceptors/JwtInterceptor";
import {provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
registerLocaleData(zh);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
    provideNzIcons(icons),
    provideNzI18n(zh_CN),
    provideAnimationsAsync('animations'),
    provideHttpClient(
      withInterceptors([
        OxHttpInterceptor,
        JwtInterceptor
      ])
    ),
    provideTranslateService({
      lang: 'en',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: 'i18n/',
        suffix: '.json'
      })
    }),
  ]
};
