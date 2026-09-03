import {Component, Input, OnChanges, Provider, provideZonelessChangeDetection, signal} from '@angular/core';
import {ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateService} from '@ngx-translate/core';
import {ProductBasic, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';

import {ProductBasicIdComponent} from './id/product.basic.id.component';
import {ProductBasicProtocolComponent} from '../../create/protocol/product.basic.protocol.component';
import {SpecModelComponent} from '../../../../../common/form/item/common/model/spec.model.component';

/**
 * 回归测试（0.4.4）：
 * Angular 22 Zoneless 下，模板绑定只会在其读取的 signal 变化（或显式 markForCheck）时重新求值。
 * 表单 CVA 子组件若用普通字段存储值，writeValue() 更新后视图不会重绘（表单值显示为空）。
 * 修复方式是把各 CVA 的 _value/_values 改为 signal。
 *
 * 这些测试刻意不调用 fixture.detectChanges()（首次渲染除外）——若依赖显式变更检测，
 * 普通字段也会通过，回归无法被捕获。必须依赖 Zoneless 调度器自动刷新。
 */

//------------------------------------------------------------------------------
// 1. 合成链路：复现 信号 → @switch/@case → 子组件 ngOnChanges → form.setValue → CVA.writeValue
//------------------------------------------------------------------------------

@Component({
  selector: 'test-cva',
  template: `<span>{{ value }}</span>`,
  standalone: true,
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: TestCvaComponent, multi: true}]
})
class TestCvaComponent implements ControlValueAccessor {
  private _value = signal('INITIAL');

  get value(): string {
    return this._value();
  }

  set value(val: string) {
    if (val !== this._value()) {
      this._value.set(val);
      this.onChange(val);
    }
    this.onTouched();
  }

  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this._value()) {
      this._value.set(obj);
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(): void {}

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};
}

@Component({
  selector: 'test-child',
  template: `<test-cva [formControl]="ctrl" />`,
  standalone: true,
  imports: [ReactiveFormsModule, TestCvaComponent]
})
class TestChildComponent implements OnChanges {
  @Input() product!: ProductBasic;

  // 对应 ProductBasicComponent 构造器里创建的 form 控件
  ctrl = new FormControl('INITIAL');

  // 对应 ngOnChanges → reset() → form.controls.id.setValue(...)
  ngOnChanges(): void {
    this.ctrl.setValue(this.product.id);
  }
}

@Component({
  selector: 'test-host',
  template: `
    @switch (tabIndex) {
      @case (0) {
        <test-child [product]="product()" />
      }
    }
  `,
  standalone: true,
  imports: [TestChildComponent]
})
class TestHostComponent {
  // 对应 ProductDetailComponent 的 product signal + @switch/@case
  tabIndex = 0;
  product = signal<ProductBasic>(new ProductBasic('', '', '', Urn.create('', UrnType.DEVICE, '', '0000'), ''));
}

//------------------------------------------------------------------------------
// 2. 真实 CVA 子组件：writeValue() 后视图必须自动重绘
//------------------------------------------------------------------------------

async function setupZoneless<T>(componentType: new () => T, providers: Provider[] = []): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [componentType as any],
    providers: [provideZonelessChangeDetection(), ...providers]
  }).compileComponents();

  const fixture = TestBed.createComponent(componentType);
  fixture.detectChanges(); // 首次渲染
  return fixture;
}

//------------------------------------------------------------------------------

describe('Zoneless CVA 表单值重绘回归测试', () => {

  describe('合成链路（signal → ngOnChanges → setValue → writeValue → 视图重绘）', () => {
    it('子组件输入更新后，CVA 表单值应自动重绘到 DOM', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();

      // 初始为空产品，CVA 显示空
      expect(fixture.nativeElement.textContent).not.toContain('REAL-ID');

      // 模拟 ProductDetailComponent.load() 后的 product.set(...)
      fixture.componentInstance.product.set(
        new ProductBasic('REAL-ID', '', '', Urn.create('', UrnType.DEVICE, '', '0000'), '')
      );

      // 不调用 detectChanges，依赖 Zoneless 调度器自动刷新
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('REAL-ID');
    });
  });

  describe('真实 CVA 子组件', () => {
    it('ProductBasicIdComponent：writeValue() 后 {{ value }} 应显示新值', async () => {
      const fixture = await setupZoneless(ProductBasicIdComponent);
      expect(fixture.nativeElement.textContent.trim()).toBe('');

      fixture.componentInstance.writeValue('REAL-ID');
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('REAL-ID');
    });

    it('SpecModelComponent：writeValue() 后 input 应显示新值', async () => {
      const fixture = await setupZoneless(SpecModelComponent);
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      fixture.componentInstance.writeValue('switch-model');
      await fixture.whenStable();

      expect(input.value).toBe('switch-model');
    });

    it('ProductBasicProtocolComponent：writeValue() 后只读标签应显示协议分类与名称', async () => {
      // 组件注入 MainI18nService，其构造器依赖 TranslateService；未加载语言字典时
      // instant(key) 原样返回 key，正好断言只读标签文本。
      const fixture = await setupZoneless(ProductBasicProtocolComponent, [
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key,
            getBrowserLang: () => null,
            use: () => undefined
          }
        }
      ]);
      fixture.componentInstance.updatable = false;

      fixture.componentInstance.writeValue(['Directly', 'wifi']);
      await fixture.whenStable();

      const text = fixture.nativeElement.textContent;
      expect(text).toContain('直连设备');
      expect(text).toContain('WiFi');
    });
  });
});
