import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';

import {StringValue} from './StringValue';
import {StringValueEditComponent} from './string.value.edit.component';

/**
 * 回归测试（0.4.7）：
 * Angular 22 Zoneless 下，弹窗 footer「确认」按钮的 disabled 由回调 `component.changed()` 决定，
 * 但该回调只在 footer 组件自身被标脏时才重新求值。输入事件只会把 content 组件视图标脏，
 * footer 是兄弟组件，不会刷新 —— 普通字段实现时确认按钮永远置灰。
 * 修复：状态改 signal，并在 effect 中调用 NzModalRef.updateConfig() 主动标脏 footer。
 *
 * 本测试刻意不手动调用 detectChanges，只依赖 Zoneless 调度器自动刷新；
 * 若用普通字段实现，按钮不会恢复可用，测试会失败。
 */

/** 等待 Zoneless 调度器冲刷（微任务 + macrotask）。 */
function flushZoneless(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve));
}

async function openModal(modal: NzModalService, oldValue: string): Promise<void> {
  const modalRef = modal.create<StringValueEditComponent, StringValue, string>({
    nzTitle: '修改模板描述',
    nzContent: StringValueEditComponent,
    nzData: new StringValue(oldValue),
    nzFooter: [
      {
        label: '取消',
        onClick: component => component!.cancel()
      },
      {
        label: '确认',
        danger: true,
        type: 'primary',
        disabled: component => !(component!.changed() || false),
        onClick: component => component!.ok()
      }
    ],
  });
  await modalRef.afterOpen.toPromise();
}

function getInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('input[nz-input]')!;
}

function getOkButton(): HTMLButtonElement {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.ant-modal-footer button'));
  const ok = buttons.find(b => b.textContent?.includes('确认'));
  if (!ok) {
    throw new Error('未找到确认按钮');
  }
  return ok;
}

describe('StringValueEditComponent Zoneless 回归测试', () => {

  let modal: NzModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, NzModalModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    modal = TestBed.inject(NzModalService);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove());
  });

  it('初始时确认按钮 disabled；输入修改后应自动变为可用', async () => {
    await openModal(modal, 'old');
    await flushZoneless();

    // 初始：changed() === false → 按钮 disabled
    expect(getOkButton().disabled).toBe(true);

    // 模拟用户输入新值
    const input = getInput();
    input.value = 'new value';
    input.dispatchEvent(new Event('input', {bubbles: true}));

    // 不调用 detectChanges，依赖 Zoneless 调度器 + effect 自动刷新 footer
    await flushZoneless();

    expect(getOkButton().disabled).toBe(false);
  });

  it('改回原值后确认按钮应再次 disabled', async () => {
    await openModal(modal, 'old');
    await flushZoneless();

    const input = getInput();
    input.value = 'new value';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    await flushZoneless();
    expect(getOkButton().disabled).toBe(false);

    input.value = 'old';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    await flushZoneless();

    expect(getOkButton().disabled).toBe(true);
  });
});
