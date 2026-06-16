import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzModalService} from 'ng-zorro-antd/modal';
import {LanguageSelectorComponent} from '../../../../dialog/language/language.selector.component';
import {LangOption} from '../../../../dialog/language/LangOption';

interface LangDesc {
  lang: string;
  label: string;
  value: string;
}

@Component({
  selector: 'description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.less'],
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    NzToolTipModule,
    NzIconModule,
    NzTagModule,
    FormsModule,
    NzRowDirective,
    NzColDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DescriptionComponent,
      multi: true
    },
    NzModalService
  ]
})
export class DescriptionComponent implements ControlValueAccessor {

  @Input() updatable = true;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  isDisabled = false;

  onChange: (value: Map<string, string>) => void = () => {
  };
  onTouched: () => void = () => {
  };

  // 动态语言列表
  langList: LangDesc[] = [
    {lang: 'en-US', label: '英文', value: ''}
  ];

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {
  }

  writeValue(obj: Map<string, string> | null): void {
    if (!obj) {
      this.resetToDefault();
      return;
    }

    const list: LangDesc[] = [];
    obj.forEach((val, lang) => {
      const label = this.getLangLabel(lang);
      list.push({lang, label, value: val});
    });

    this.langList = list.length ? list : [{lang: 'en-US', label: '英文', value: ''}];
  }

  private getLangLabel(lang: string): string {
    const map: Record<string, string> = {
      'en-US': '英文',
      'zh-CN': '简体中文',
      'zh-TW': '繁体中文',
      'ja-JP': '日语',
      'ko-KR': '韩语',
      'fr-FR': '法语',
      'de-DE': '德语',
      'es-ES': '西班牙语',
      'ru-RU': '俄语',
    };
    return map[lang] ?? lang;
  }

  private resetToDefault() {
    this.langList = [{lang: 'en-US', label: '英文', value: ''}];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  emitChange() {
    const map = new Map<string, string>();
    this.langList.forEach(item => {
      map.set(item.lang, item.value.trim());
    });
    this.onChange(map);
    this.changed.emit();
    this.onTouched();
  }

  addLang() {
    const modal = this.modal.create<any, LangDesc[], any>({
      nzTitle: '添加描述语言',
      nzWidth: 600,
      nzContent: LanguageSelectorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.langList,
      nzFooter: [
        {
          label: '取消',
          onClick: c => c.cancel()
        },
        {
          label: '确定',
          type: 'primary',
          disabled: component => component!.disabled || false,
          onClick: c => c.ok()
        }
      ],
    });

    modal.afterClose.subscribe((selectedLangArray: LangOption[]) => {
      if (!selectedLangArray || selectedLangArray.length === 0) return;

      selectedLangArray.forEach(langItem => {
        const exist = this.langList.some(item => item.lang === langItem.lang);
        if (!exist) {
          this.langList.push({
            lang: langItem.lang,
            label: langItem.label,
            value: ''
          });
        }
      });

      this.emitChange();
    });
  }

  // 删除语言（en-US 不可删）
  removeLang(index: number) {
    const item = this.langList[index];
    if (item.lang === 'en-US') return;

    this.langList.splice(index, 1);
    this.emitChange();
  }
}
