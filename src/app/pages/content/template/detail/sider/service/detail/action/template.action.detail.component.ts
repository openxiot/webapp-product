import {
  Component,
  effect,
  EventEmitter,
  input,
  OnInit,
  Output
} from '@angular/core';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';

import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActionTemplate,
  Argument,
  ServiceTemplate
} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {SpecCodeComponent} from '../../../../../../../../common/form/item/common/code/spec.code.component';
import {
  DescriptionComponent
} from '../../../../../../../../common/form/item/common/description/description.component';
import {SpecIidComponent} from '../../../../../../../../common/form/item/common/iid/spec.iid.component';
import {
  SpecRequiredComponent
} from '../../../../../../../../common/form/item/common/required/spec.required.component';
import {TemplateOp} from '../../../../../../../../typedef/template/TemplateEditor';
import {TemplateArgumentsComponent} from '../arguments/template.arguments.component';

@Component({
  selector: 'template-action-detail',
  templateUrl: './template.action.detail.component.html',
  styleUrl: './template.action.detail.component.less',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSpaceModule,
    NzIconModule,
    NzCardModule,
    TranslatePipe,
    SpecCodeComponent,
    DescriptionComponent,
    SpecIidComponent,
    SpecRequiredComponent,
    TemplateArgumentsComponent
  ],
  providers: [],
})
export class TemplateActionDetailComponent implements OnInit {

  editable = input(false);
  service = input.required<ServiceTemplate>();
  action = input.required<ActionTemplate>();
  language = input('zh-CN');
  @Output() op = new EventEmitter<TemplateOp>();

  form: FormGroup<{
    required: FormControl<boolean>,
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    argumentIn: FormControl<Argument[]>,
    argumentOut: FormControl<Argument[]>,
  }>;

  /** 已加载的 action iid：只在切到别的节点时 reload，同 iid 自提交不复位表单。 */
  private loadedIid: number | undefined = undefined;

  constructor(
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      required: this.fb.control(true, [Validators.required]),
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-z][a-z0-9-]*$/)
      ]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      argumentIn: this.fb.control<Argument[]>([]),
      argumentOut: this.fb.control<Argument[]>([]),
    });

    effect(() => {
      const a = this.action();
      if (a && this.loadedIid !== a.iid) {
        this.loadedIid = a.iid;
        this.reload();
      }
    });
  }

  ngOnInit(): void {
    const a = this.action();
    if (a && this.loadedIid !== a.iid) {
      this.loadedIid = a.iid;
      this.reload();
    }
  }

  private reload() {
    const a = this.action();
    const svc = this.service();
    if (!a || !svc) return;
    this.form.controls.required.setValue(a.required);
    this.form.controls.iid.setValue(a.iid);
    this.form.controls.ns.setValue(a.type.ns);
    this.form.controls.code.setValue(a.type.name);
    this.form.controls.description.setValue(a.description);

    this.form.controls.argumentIn.setValue(this.toArguments(a.in, svc));
    this.form.controls.argumentOut.setValue(this.toArguments(a.out, svc));
  }

  /** 参数行按属性 iid 过滤（忽略指向已删属性的悬空参数），且逐项克隆：行内编辑永不落地到树。 */
  private toArguments(map: Map<number, Argument>, svc: ServiceTemplate): Argument[] {
    const list: Argument[] = [];
    for (const argument of map.values()) {
      if (!svc.properties.has(argument.piid)) continue;
      list.push(Argument.of(argument.piid, argument.minRepeat, argument.maxRepeat));
    }
    return list;
  }

  /** 从共享 arguments 组件的当前表单值（行内克隆快照）重建该方向参数 Map。 */
  private argumentMap(dir: 'in' | 'out'): Map<number, Argument> {
    const arr = dir === 'in' ? this.form.controls.argumentIn.value : this.form.controls.argumentOut.value;
    const map = new Map<number, Argument>();
    for (const a of arr) {
      map.set(a.piid, Argument.of(a.piid, a.minRepeat, a.maxRepeat));
    }
    return map;
  }

  protected onRequiredChanged() {
    this.op.emit({
      kind: 'updateAction',
      serviceIid: this.service().iid,
      actionIid: this.action().iid,
      patch: {required: this.form.value.required || false},
    });
  }

  onRemoved() {
    this.op.emit({kind: 'removeAction', serviceIid: this.service().iid, actionIid: this.action().iid});
  }

  protected onIIDChanged() {
    this.op.emit({
      kind: 'updateAction',
      serviceIid: this.service().iid,
      actionIid: this.action().iid,
      patch: {iid: this.form.controls.iid.value},
    });
  }

  protected onDescriptionChanged() {
    this.op.emit({
      kind: 'updateAction',
      serviceIid: this.service().iid,
      actionIid: this.action().iid,
      patch: {description: this.form.controls.description.value},
    });
  }

  protected onArgumentInChanged() {
    if (!this.editable()) return;
    this.op.emit({
      kind: 'updateAction',
      serviceIid: this.service().iid,
      actionIid: this.action().iid,
      patch: {in: this.argumentMap('in')},
    });
  }

  protected onArgumentOutChanged() {
    if (!this.editable()) return;
    this.op.emit({
      kind: 'updateAction',
      serviceIid: this.service().iid,
      actionIid: this.action().iid,
      patch: {out: this.argumentMap('out')},
    });
  }
}
