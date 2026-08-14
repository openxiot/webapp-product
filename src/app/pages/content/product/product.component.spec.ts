import {Component, Input, provideZonelessChangeDetection, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {provideRouter, RouterLink} from '@angular/router';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzSegmentedComponent} from 'ng-zorro-antd/segmented';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {NzIconDirective, provideNzIcons} from 'ng-zorro-antd/icon';
import {AppstoreOutline, BarsOutline} from '@ant-design/icons-angular/icons';
import {NzRowDirective, NzColDirective} from 'ng-zorro-antd/grid';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MainService} from '../../../service/main.service';
import {ProductComponent} from './product.component';

/**
 * 回归测试（0.4.7）：
 * nz-segmented 点击后 ngModelChange 吐出的是选项的 `value`（原实现为字符串 'Card'/'List'），
 * 而 viewMode 是数字、@switch 用 `case 0/1` 匹配 → 切换后无 case 命中，内容区为空。
 * 修复：选项 value 改为数字 0/1、viewMode 改为 signal、@switch 读 viewMode()。
 * 测试用 stub 子组件隔离 ProductComponent 自身的切换逻辑，不依赖 grid/list 内部实现。
 */

@Component({selector: 'product-grid', standalone: true, template: '<div class="grid-marker">GRID</div>'})
class GridStub {
  @Input() products: any;
}

@Component({selector: 'product-list', standalone: true, template: '<div class="list-marker">LIST</div>'})
class ListStub {
  @Input() products: any;
}

// 替代 appBreadcrumbTranslate 指令，避免引入 ActivatedRoute/Translate 重依赖
@Component({selector: 'nz-breadcrumb[appBreadcrumbTranslate]', standalone: true, template: ''})
class BreadcrumbStub {
  @Input() nzAutoGenerate: any;
  @Input() nzPageHeaderBreadcrumb: any;
}

const mockTranslate = {
  currentLang: 'zh-CN',
  instant: (key: string) => key,
  get: (key: string) => of(key),
  stream: (key: string) => of(key),
  translate: (key: string) => signal(key),
  onLangChange: of(null),
  onTranslationChange: of(null),
  onDefaultLangChange: of(null),
};

async function setupProductComponent() {
  TestBed.overrideComponent(ProductComponent, {
    set: {
      imports: [
        NzPageHeaderModule,
        NzSpinModule,
        NzSegmentedComponent,
        FormsModule,
        NzRowDirective,
        NzColDirective,
        NzButtonComponent,
        NzWaveDirective,
        RouterLink,
        TranslatePipe,
        NzIconDirective,
        GridStub,
        ListStub,
        BreadcrumbStub,
      ],
    },
  });

  await TestBed.configureTestingModule({
    imports: [NoopAnimationsModule],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      provideNzIcons([AppstoreOutline, BarsOutline]),
      {provide: MainService, useValue: {getAllProducts: () => of([])}},
      {provide: TranslateService, useValue: mockTranslate},
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ProductComponent);
  fixture.detectChanges(); // 首次渲染
  return fixture;
}

/** 等待 Zoneless 调度器冲刷。 */
function flushZoneless(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve));
}

describe('ProductComponent viewMode 切换回归测试', () => {
  afterEach(() => {
    localStorage.removeItem('productViewMode');
  });

  it('初始显示 grid；点击 List 段后应切换为 list，内容区不为空', async () => {
    const fixture = await setupProductComponent();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('product-grid')).toBeTruthy();

    const items = el.querySelectorAll<HTMLElement>('label.ant-segmented-item');
    expect(items.length).toBe(2);

    items[1].click();
    await flushZoneless();
    await fixture.whenStable();

    expect(el.querySelector('product-list')).toBeTruthy();
    expect(el.querySelector('product-grid')).toBeNull();
  });

  it('切回 Card 段后应恢复 grid', async () => {
    const fixture = await setupProductComponent();
    const el: HTMLElement = fixture.nativeElement;

    const items = el.querySelectorAll<HTMLElement>('label.ant-segmented-item');
    items[1].click();
    await flushZoneless();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('product-list')).toBeTruthy();

    items[0].click();
    await flushZoneless();
    await fixture.whenStable();

    expect(el.querySelector('product-grid')).toBeTruthy();
    expect(el.querySelector('product-list')).toBeNull();
  });
});
