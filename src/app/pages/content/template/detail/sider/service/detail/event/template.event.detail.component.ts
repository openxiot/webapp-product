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
  Argument,
  EventTemplate,
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
  selector: 'template-event-detail',
  templateUrl: './template.event.detail.component.html',
  styleUrl: './template.event.detail.component.less',
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
export class TemplateEventDetailComponent implements OnInit {

  editable = input(false);
  service = input.required<ServiceTemplate>();
  event = input.required<EventTemplate>();
  @Output() op = new EventEmitter<TemplateOp>();

  form: FormGroup<{
    required: FormControl<boolean>,
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    arguments: FormControl<Argument[]>,
  }>;

  /** 已加载的 event iid：只在切到别的节点时 reload，同 iid 自提交不复位表单。 */
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
      arguments: this.fb.control<Argument[]>([]),
    });

    effect(() => {
      const e = this.event();
      if (e && this.loadedIid !== e.iid) {
        this.loadedIid = e.iid;
        this.reload();
      }
    });
  }

  ngOnInit(): void {
    const e = this.event();
    if (e && this.loadedIid !== e.iid) {
      this.loadedIid = e.iid;
      this.reload();
    }
  }

  private reload() {
    const e = this.event();
    const svc = this.service();
    if (!e || !svc) return;
    this.form.controls.required.setValue(e.required);
    this.form.controls.iid.setValue(e.iid);
    this.form.controls.ns.setValue(e.type.ns);
    this.form.controls.code.setValue(e.type.name);
    this.form.controls.description.setValue(e.description);

    this.form.controls.arguments.setValue(this.toArguments(e.arguments, svc));
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

  /** 从共享 arguments 组件的当前表单值（行内克隆快照）重建参数 Map。 */
  private argumentMap(): Map<number, Argument> {
    const map = new Map<number, Argument>();
    for (const a of this.form.controls.arguments.value) {
      map.set(a.piid, Argument.of(a.piid, a.minRepeat, a.maxRepeat));
    }
    return map;
  }

  protected onRequiredChanged() {
    this.op.emit({
      kind: 'updateEvent',
      serviceIid: this.service().iid,
      eventIid: this.event().iid,
      patch: {required: this.form.value.required || false},
    });
  }

  onRemoved() {
    this.op.emit({kind: 'removeEvent', serviceIid: this.service().iid, eventIid: this.event().iid});
  }

  protected onIIDChanged() {
    this.op.emit({
      kind: 'updateEvent',
      serviceIid: this.service().iid,
      eventIid: this.event().iid,
      patch: {iid: this.form.controls.iid.value},
    });
  }

  protected onDescriptionChanged() {
    this.op.emit({
      kind: 'updateEvent',
      serviceIid: this.service().iid,
      eventIid: this.event().iid,
      patch: {description: this.form.controls.description.value},
    });
  }

  protected onArgumentsChanged() {
    if (!this.editable()) return;
    this.op.emit({
      kind: 'updateEvent',
      serviceIid: this.service().iid,
      eventIid: this.event().iid,
      patch: {arguments: this.argumentMap()},
    });
  }
}
