import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
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
  Service,
  Event,
  Argument,
  ServiceTemplate,
  EventTemplate,
  ActionTemplate
} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ConfirmComponent} from '../../../../../common/dialog/confirm/confirm.component';
import {MainI18nService} from '../../../../../../../../../service/i18n.service';
import {EditorNamespaceComponent} from '../property/namespace/editor.namespace.component';
import {Arg} from '../action/argument/Arg';
import {EditorServiceActionArgumentComponent} from '../action/argument/editor.service.action.argument.component';
import {TranslatePipe} from '@ngx-translate/core';
import {CodeComponent} from '../../../../../../../../../common/form/item/common/code/code.component';
import {
  DescriptionComponent
} from '../../../../../../../../../common/form/item/common/description/description.component';

@Component({
  selector: 'template-card-event',
  templateUrl: './template.card.event.component.html',
  styleUrls: ['./template.card.event.component.less'],
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
    CodeComponent,
    DescriptionComponent
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateCardEventComponent implements OnInit, OnChanges {

  @Input() editable: boolean = false;
  @Input() service!: ServiceTemplate;
  @Input() event!: EventTemplate;
  @Input() language!: string;
  @Output() changed = new EventEmitter<void>();
  @Output() removed = new EventEmitter<EventTemplate>();

  form: FormGroup<{
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
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9-]*$/)
      ]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      arguments: this.fb.array<
        FormGroup<{
          argument: FormControl<Arg>,
        }>
      >([]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event']) {
      this.reload();
    }
  }

  ngOnInit(): void {
    this.reload();
  }

  private reload() {
    this.form.controls.iid.setValue(this.event.iid);
    this.form.controls.ns.setValue(this.event.type.ns);
    this.form.controls.code.setValue(this.event.type.name);
    this.form.controls.description.setValue(this.service.description);

    this.arguments.clear();

    for (const [iid, argument] of this.event.arguments.entries()) {
      const property = this.service.properties.get(iid);
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
    return this.fb.group({
      argument: new Arg(argument, property, this.language)
    });
  }

  addArgumentItem() {
  //   const exclusion = new Set(this.event.getArguments().map(x => x.piid));
  //
  //   const modal = this.modal.create<SelectArgumentComponent, SelectArgument, Set<number>>({
  //     nzTitle: '选择属性作为参数',
  //     nzWidth: 1000,
  //     nzContent: SelectArgumentComponent,
  //     nzViewContainerRef: this.viewContainerRef,
  //     nzData: new SelectArgument(this.service, exclusion, this.language),
  //     nzFooter: [
  //       {
  //         label: '取消',
  //         onClick: component => component!.cancel()
  //       },
  //       {
  //         label: '确认',
  //         danger: true,
  //         type: 'primary',
  //         onClick: component => component!.ok()
  //       }
  //     ],
  //   });
  //
  //   modal.afterClose.subscribe(result => {
  //     if (result) {
  //       const sortedResult = Array.from(result).sort((a, b) => a - b);
  //       for (let iid of sortedResult) {
  //         this.event.arguments.set(iid, new Argument(iid));
  //       }
  //
  //       this.arguments.clear();
  //       for (const [iid, argument] of this.event.arguments.entries()) {
  //         const property = this.service.properties.get(iid);
  //         if (property) {
  //           this.addArgument(argument, property);
  //         }
  //       }
  //
  //       this.onChanged();
  //     }
  //   });
  }

  removeArgument(item: FormGroup<{ argument: FormControl<Arg> }>, i: number) {
    this.arguments.removeAt(i);
    this.onChanged();
  }

  onChanged() {
    this.changed.emit();
  }

  onRemoved() {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: this.i18n.translate.instant('您真的要删除这个事件吗？'),
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.service.description.get('zh-CN'),
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

    // modal.afterClose.subscribe(result => {
    //   if (result) {
    //     this.removed.emit(this.event);
    //   }
    // });
  }

  // onSubmit() {
  //   this.event.iid = this.form.controls.iid.value;
  //   this.event.type.name = this.form.controls.code.value;
  //   this.event.description.set('zh-CN', this.form.controls.descriptionZHCN.value);
  //   this.event.description.set('zh-TW', this.form.controls.descriptionZHTW.value);
  //   this.event.description.set('en-US', this.form.controls.descriptionENUS.value);
  //
  //   // todo: save
  // }
}
