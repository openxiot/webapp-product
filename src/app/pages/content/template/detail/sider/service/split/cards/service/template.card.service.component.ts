import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges,
  ViewContainerRef
} from '@angular/core';

import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';

import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {Property, Service, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ConfirmComponent} from '../../../../../common/dialog/confirm/confirm.component';
import {EditorNamespaceComponent} from '../property/namespace/editor.namespace.component';

@Component({
  selector: 'template-card-service',
  templateUrl: './template.card.service.component.html',
  styleUrls: ['./template.card.service.component.less'],
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
    EditorNamespaceComponent
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateCardServiceComponent implements OnInit {

  @Input() service!: ServiceTemplate;
  @Input() language!: string;
  // @Output() removed = new EventEmitter<Service>();

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    descriptionZHCN: FormControl<string>,
    descriptionZHTW: FormControl<string>,
    descriptionENUS: FormControl<string>,
  }>;

  changed: boolean = false;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      descriptionZHCN: this.fb.control('', [Validators.required]),
      descriptionZHTW: this.fb.control('', [Validators.required]),
      descriptionENUS: this.fb.control('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.form.controls.iid.setValue(this.service.iid);
    this.form.controls.ns.setValue(this.service.type.ns);
    this.form.controls.code.setValue(this.service.type.name);
    this.form.controls.descriptionZHCN.setValue(this.service.description.get('zh-CN') || '');
    this.form.controls.descriptionZHTW.setValue(this.service.description.get('zh-TW') || '');
    this.form.controls.descriptionENUS.setValue(this.service.description.get('en-US') || '');
  }

  onChanged() {
    this.changed = true;
  }

  onRemoved() {
    // const modal = this.modal.create<ConfirmComponent, string, string>({
    //   nzTitle: '您真的要删除这个功能组吗？',
    //   nzContent: ConfirmComponent,
    //   nzViewContainerRef: this.viewContainerRef,
    //   nzData: this.service.description.get('zh-CN'),
    //   nzFooter: [
    //     {
    //       label: '取消',
    //       onClick: component => component!.cancel()
    //     },
    //     {
    //       label: '确认',
    //       danger: true,
    //       type: 'primary',
    //       onClick: component => component!.ok()
    //     }
    //   ],
    // });
    //
    // modal.afterClose.subscribe(result => {
    //   if (result) {
    //     this.removed.emit(this.service);
    //   }
    // });
  }

  onSubmit() {
    this.service.iid = this.form.controls.iid.value;
    this.service.type.name = this.form.controls.code.value;
    this.service.description.set('zh-CN', this.form.controls.descriptionZHCN.value);
    this.service.description.set('zh-TW', this.form.controls.descriptionZHTW.value);
    this.service.description.set('en-US', this.form.controls.descriptionENUS.value);

    // todo: save

    this.changed = false;
  }
}
