import {Component, input, provideZonelessChangeDetection, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DeviceTemplate} from '@openxiot/xiot-core-spec-ts';
import {reduceTemplate, TemplateOp} from '../../../../typedef/template/TemplateEditor';

/**
 * 回归测试（0.5.x，Plan A / Phase 2）：
 * Angular 22 Zoneless 下变更检测走「脏路径」：只有当模板读取的 signal 值变化时该视图才被刷新，
 * 再沿整棵默认(Default)子树级联重绘。TemplateDetailComponent 不再手动 cdr.detectChanges()，
 * 而是把每次编辑收敛成 TemplateOp 交给纯函数 reduceTemplate()，产出【新的顶层 DeviceTemplate
 * 引用】（内部未动分支保持同一引用），使 template() 产生新值触发一轮变更检测。
 *
 * 本测试刻意不调用 fixture.detectChanges()（首次渲染除外）：
 *  1) 在共享模型对象上「原地修改」后仅靠 flush，子组件应【不会】重绘 —— 这正是此前页面
 *     必须依赖手动 cdr.detectChanges() 的根因；
 *  2) 冒泡 onOp → reduceTemplate 产生新的顶层引用后，不手动 detectChanges 也应由 Zoneless
 *     调度器自动重绘。
 */
describe('TemplateDetail 顶层引用提交（onOp + reduceTemplate）回归测试', () => {

  // 与 template.detail.component.html 相同的最小化结构：
  // 顶层 @if(template(); as t) → Default 子组件读取共享 description Map。
  @Component({
    selector: 'tpl-detail-child',
    template: `<span id="title">{{ template().description.get(lang) }}</span>`,
    standalone: true,
  })
  class TplDetailChildComponent {
    template = input.required<DeviceTemplate>();
    lang = 'zh-CN';
  }

  @Component({
    selector: 'tpl-detail-top',
    template: `@if (template(); as t) { <tpl-detail-child [template]="t"/> }`,
    standalone: true,
    imports: [TplDetailChildComponent],
  })
  class TplDetailTopComponent {
    // 与 TemplateDetailComponent.template 相同的单一数据源
    template = signal<DeviceTemplate | undefined>(undefined);

    // 与 TemplateDetailComponent.onOp() 相同的语义：换新顶层引用、内部对象不变
    onOp(op: TemplateOp): void {
      const t = this.template();
      if (!t) return;
      this.template.set(reduceTemplate(t, op));
    }
  }

  function makeTemplate(title: string): DeviceTemplate {
    const description = new Map<string, string>([['zh-CN', title]]);
    // type 字段仅透传展示，测试中无需真实 DeviceType
    return new DeviceTemplate({model: 'M', version: 1, organization: 'o'} as never, description, []);
  }

  let fixture: ComponentFixture<TplDetailTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TplDetailTopComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TplDetailTopComponent);
    fixture.detectChanges(); // 仅首次渲染
  });

  it('原地修改共享模型 + onOp 换新顶层引用后应自动重绘子组件文本（不手动 detectChanges）', async () => {
    const top = fixture.componentInstance;
    top.template.set(makeTemplate('旧标题'));
    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('#title') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.textContent).toBe('旧标题');

    // 模拟真实编辑流：深层组件在同一个共享 description Map 上原地写入标题并冒泡 changed。
    // 只 flush、不换引用 → Zoneless 下不应重绘（否则回归无法被捕获）。
    top.template()!.description.set('zh-CN', '新标题');
    await fixture.whenStable();
    expect(el.textContent).toBe('旧标题');

    // Phase 2：冒泡到顶层后调用 onOp → reduceTemplate 换新顶层引用，触发自动重绘。
    top.onOp({kind: 'setDeviceDescription', lang: 'zh-CN', value: '新标题'});
    await fixture.whenStable();
    expect(el.textContent).toBe('新标题');
  });
});
