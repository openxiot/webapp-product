import {
  Component,
  effect,
  EventEmitter,
  input,
  OnInit,
  Output,
  ViewContainerRef
} from '@angular/core';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';

import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  Property,
  Argument,
  ServiceTemplate,
  EventTemplate
} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {MainI18nService} from '../../../../../../../../service/i18n.service';
import {Arg} from '../action/argument/Arg';
import {EditorServiceActionArgumentComponent} from '../action/argument/editor.service.action.argument.component';
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
import {SelectArgument} from '../../../../../../../../common/dialog/instance/select/argument/SelectArgument';
import {SelectArgumentComponent} from '../../../../../../../../common/dialog/instance/select/argument/select.argument.component';

@Component({
  selector: 'template-event-detail',
  templateUrl: './template.event.detail.component.html',
  styleUrl: './template.event.detail.component.less',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzCheckboxModule,
    NzRadioModule,
    NzSpaceModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    EditorServiceActionArgumentComponent,
    TranslatePipe,
    SpecCodeComponent,
    DescriptionComponent,
    SpecIidComponent,
    SpecRequiredComponent
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateEventDetailComponent implements OnInit {

  editable = input(false);
  service = input.required<ServiceTemplate>();
  event = input.required<EventTemplate>();
  language = input('zh-CN');
  @Output() op = new EventEmitter<TemplateOp>();

  form: FormGroup<{
    required: FormControl<boolean>,
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    arguments: FormArray<FormGroup<{
      argument: FormControl<Arg>,
    }>>,
  }>;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private fb: NonNullableFormBuilder,
    public i18n: MainI18nService
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
      arguments: this.fb.array<
        FormGroup<{
          argument: FormControl<Arg>,
        }>
      >([]),
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

  /** 已加载的 event iid：只在切到别的节点时 reload，同 iid 自提交不复位表单。 */
  private loadedIid: number | undefined = undefined;

  private reload() {
    const e = this.event();
    const svc = this.service();
    if (!e || !svc) return;
    this.form.controls.required.setValue(e.required);
    this.form.controls.iid.setValue(e.iid);
    this.form.controls.ns.setValue(e.type.ns);
    this.form.controls.code.setValue(e.type.name);
    this.form.controls.description.setValue(e.description);

    this.arguments.clear();

    for (const [iid, argument] of e.arguments.entries()) {
      const property = svc.properties.get(iid);
      if (property) {
        this.addArgument(argument, property);
      }
    }
  }

  private addArgument(argument: Argument, property: Property) {
    console.log('addArgument: ', property.iid);
    this.arguments.push(this.createArgumentItem(argument, property));
  }

  get arguments(): FormArray<FormGroup<{
    argument: FormControl<Arg>
  }>> {
    return this.form.controls.arguments;
  }

  createArgumentItem(argument: Argument, property: Property): FormGroup<{
    argument: FormControl<Arg>,
  }> {
    // 行内永远持有一份克隆，编辑 min/max 不会原地改树上的 Argument。
    const local = Argument.of(argument.piid, argument.minRepeat, argument.maxRepeat);
    return this.fb.group({
      argument: new Arg(local, property, this.language())
    });
  }

  addArgumentItem() {
    // 排除当前参数行已在用的 piid，弹窗只列出尚未作为参数的属性
    const exclusion = new Set(this.arguments.controls.map(r => r.controls.argument.value.argument.piid));

    const modal = this.modal.create<SelectArgumentComponent, SelectArgument, Set<number>>({
      nzTitle: this.i18n.translate.instant('选择属性作为参数'),
      nzWidth: 1000,
      nzContent: SelectArgumentComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new SelectArgument(this.service(), exclusion, this.language()),
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
        const sortedResult = Array.from(result).sort((a, b) => a - b);
        for (let iid of sortedResult) {
          const property = this.service().properties.get(iid);
          if (property) {
            this.arguments.push(this.createArgumentItem(Argument.of(iid, 1, 1), property));
          }
        }

        // 手动推进 FormArray 后重建 Map 持久化；同 iid 自提交不 reload。
        this.emitArgumentsPatch();
      }
    });
  }

  removeArgument(item: FormGroup<{ argument: FormControl<Arg> }>, i: number) {
    this.arguments.removeAt(i);
    this.emitArgumentsPatch();
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

  /** 从当前行（行内是克隆 Argument）重建整个参数 Map，key/Argument.piid 均为属性 iid。 */
  private argumentMap(): Map<number, Argument> {
    const map = new Map<number, Argument>();
    for (const row of this.arguments.controls) {
      const a = row.controls.argument.value.argument;   // row-local clone，可能已被 editor onChanged 刷新
      map.set(a.piid, Argument.of(a.piid, a.minRepeat, a.maxRepeat));
    }
    return map;
  }

  protected onArgumentRowChanged() {
    this.emitArgumentsPatch();
  }

  private emitArgumentsPatch() {
    this.op.emit({
      kind: 'updateEvent',
      serviceIid: this.service().iid,
      eventIid: this.event().iid,
      patch: {arguments: this.argumentMap()},
    });
  }
}
