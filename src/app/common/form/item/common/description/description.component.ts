import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzModalService} from 'ng-zorro-antd/modal';
import {LanguageAddComponent} from '../../../../dialog/language/add/language.add.component';
import {LangOption} from '../../../../dialog/language/add/LangOption';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../service/i18n.service';

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
    TranslatePipe,
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

  // bcp47 → 语言名称映射，从 i18n 服务构建
  private bcp47LabelMap = new Map<string, string>();

  // 动态语言列表（初始只有英文，后续动态添加）
  langList: LangDesc[] = [];

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public i18n: MainI18nService,
  ) {
    // 从 i18n 服务构建完整的 bcp47 → 名称映射（覆盖全部 66 种语言）
    for (const lang of this.i18n.languages) {
      this.bcp47LabelMap.set(lang.bcp47, lang.name);
    }
    // 初始默认值
    this.langList = [this.createLangDesc('en-US')];
  }

  private createLangDesc(bcp47: string): LangDesc {
    return {
      lang: bcp47,
      label: this.bcp47LabelMap.get(bcp47) ?? bcp47,
      value: '',
    };
  }

  writeValue(obj: Map<string, string> | null): void {
    if (!obj) {
      this.resetToDefault();
      return;
    }

    const list: LangDesc[] = [];
    obj.forEach((val, lang) => {
      list.push({lang, label: this.bcp47LabelMap.get(lang) ?? lang, value: val});
    });

    this.langList = list.length ? list : [this.createLangDesc('en-US')];
  }

  private resetToDefault() {
    this.langList = [this.createLangDesc('en-US')];
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
      nzTitle: this.i18n.translate.instant('添加描述语言'),
      nzWidth: 1200,
      nzContent: LanguageAddComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.langList,
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: c => c.cancel()
        },
        {
          label: this.i18n.translate.instant('确定'),
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
