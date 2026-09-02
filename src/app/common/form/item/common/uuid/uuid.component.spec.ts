import {Component, computed, inject, provideZonelessChangeDetection} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';

import {UuidComponent} from './uuid.component';

// 回归测试（0.4.9）：
// SpecDeviceEdit 等编辑页加载到数据后用 form.controls.uuid.setValue() 回填 UUID，
// SpecCodeComponent 已用 signal 存储故「代码」能显示，而 uuid 组件用普通字段存储，
// writeValue() 更新后不会标脏组件自身视图 → UUID 一直为空（与 0.4.4-0.4.8 已修的其它 CVA 同类问题）。
// 修复：inputHex 改为 signal，模板 [ngModel]="inputHex()" 读取它。
// 本测试刻意不手动调用 detectChanges（首次渲染除外）；若回退为普通字段，首个用例会失败。

function flushZoneless(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve));
}

@Component({
  selector: 'uuid-repro-host',
  standalone: true,
  imports: [ReactiveFormsModule, UuidComponent],
  template: `<form [formGroup]="form"><uuid formControlName="uuid" [updatable]="true"/></form>`,
})
class UuidReproHost {
  private fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    uuid: this.fb.control(0),
  });
}

function getInput(fixture: ComponentFixture<UuidReproHost>): HTMLInputElement {
  const el = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  if (!el) throw new Error('uuid input not found');
  return el;
}

describe('UuidComponent Zoneless 回填回归测试', () => {

  let fixture: ComponentFixture<UuidReproHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        {provide: TranslateService, useValue: {instant: (k: string) => k, translate: () => computed(() => '')}},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UuidReproHost);
    fixture.detectChanges(); // 仅首次渲染
  });

  it('单独挂载时 writeValue() 后应自动重绘输入框（不依赖表单/手动 detectChanges）', async () => {
    // 复现 product.basic.regression.spec.ts 的"单独挂载 CVA"形态：
    // 无 [formGroup]/formControlName，直接调用组件 writeValue()。
    // Zoneless 下普通字段不会标脏本组件视图 → 预期：此用例在纯普通字段实现下失败。
    const solo = TestBed.createComponent(UuidComponent);
    solo.detectChanges();

    solo.componentInstance.writeValue(0x01020304);
    await flushZoneless();

    const input = solo.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('01020304');
  });

  it('setValue 回填后应显示 8 位十六进制（不手动 detectChanges）', async () => {
    // 模拟编辑页加载到数据后回填 uuid（如 0x01020304）
    fixture.componentInstance.form.controls.uuid.setValue(0x01020304);
    await flushZoneless();

    expect(fixture.componentInstance.form.controls.uuid.value).toBe(0x01020304);
    expect(getInput(fixture).value).toBe('01020304');
  });
});
