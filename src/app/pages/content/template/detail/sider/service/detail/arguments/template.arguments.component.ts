import {Component, EventEmitter, input, Output, signal, ViewContainerRef} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberComponent} from 'ng-zorro-antd/input-number';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzModalService} from 'ng-zorro-antd/modal';
import {TranslatePipe} from '@ngx-translate/core';
import {Argument} from '@openxiot/xiot-core-spec-ts';
import {MainI18nService} from '../../../../../../../../service/i18n.service';
import {
  SelectArgument,
  ServiceLike
} from '../../../../../../../../common/dialog/instance/select/argument/SelectArgument';
import {SelectArgumentComponent} from '../../../../../../../../common/dialog/instance/select/argument/select.argument.component';

/**
 * 共享「参数」表单值组件：action 的 in/out 与 event 的 arguments 都复用同一实例。
 * 表单值 = 有序 Argument[]（外部 FormControl），内部按行持有克隆对象，行内增删与 min/max
 * 编辑永不原地改树/Map 上的 Argument（保住 reducer 结构共享）。
 */
@Component({
  selector: 'template-arguments',
  templateUrl: './template.arguments.component.html',
  styleUrl: './template.arguments.component.less',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzInputNumberComponent,
    NzSpaceModule,
    NzRowDirective,
    NzColDirective,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: TemplateArgumentsComponent,
      multi: true
    },
    NzModalService
  ],
})
export class TemplateArgumentsComponent implements ControlValueAccessor {

  /** 模板处于预览/上线等非编辑态（editable=false）时不可增/删/改参数。 */
  updatable = input(false);

  /** 行内按 piid 解析属性 + 加参数弹窗的候选列表来源。 */
  service = input.required<ServiceLike>();

  /** 加参数弹窗标题的 i18n key：默认「参数」，action 出参父级传「结果」。 */
  pickTitle = input('选择属性作为参数');

  @Output() changed = new EventEmitter<void>();

  // 组件内部维护的行（每项为行内克隆 Argument）
  items = signal<Argument[]>([]);

  // 禁用状态：表单 setDisabledState 时连同 updatable 一起置灰
  isDisabled = false;

  onChange: (value: Argument[]) => void = () => {
  };
  onTouched: () => void = () => {
  };

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public i18n: MainI18nService
  ) {
  }

  // --- ControlValueAccessor 接口方法 ---

  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this.items()) {
      this.items.set(this.cloneAll(obj as Argument[]));
    }
  }

  registerOnChange(fn: (value: Argument[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // --- 行操作 ---

  /** 行内永远持有一份克隆：加参/重播种只存克隆，编辑 min/max 不落地到树。 */
  private cloneAll(list: Argument[]): Argument[] {
    return list.map(a => Argument.of(a.piid, a.minRepeat, a.maxRepeat));
  }

  /** 提交给外层表单的快照：新数组 + 新克隆，保证 FormControl 值引用每次变化。 */
  private snapshot(): Argument[] {
    return this.cloneAll(this.items());
  }

  onChanged() {
    this.onChange(this.snapshot());
    this.changed.emit();
  }

  protected addArgument() {
    // 排除已在用的 piid，弹窗只列出尚未作为参数的属性
    const exclusion = new Set(this.items().map(a => a.piid));

    const modal = this.modal.create<SelectArgumentComponent, SelectArgument, Set<number>>({
      nzTitle: this.i18n.translate.instant(this.pickTitle()),
      nzWidth: 1000,
      nzContent: SelectArgumentComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new SelectArgument(this.service(), exclusion, this.i18n.getCurrentLang()),
      nzFooter: [
        {
          label: this.i18n.translate.instant('取消'),
          onClick: component => component!.cancel()
        },
        {
          label: this.i18n.translate.instant('确认'),
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        const added = Array.from(result)
          .sort((a, b) => a - b)
          .map(iid => Argument.of(iid, 1, 1));
        this.items.set([...this.items(), ...added]);
        this.onChanged();
      }
    });
  }

  protected removeArgument(arg: Argument) {
    this.items.set(this.items().filter(a => a.piid !== arg.piid));
    this.onChanged();
  }

  protected propertyDescription(arg: Argument): string {
    const p = this.service().getProperties().find(x => x.iid === arg.piid);
    if (p) {
      return p.description.get(this.i18n.getCurrentLang()) || p.description.get('en-US') || '';
    }
    return '?';
  }
}
