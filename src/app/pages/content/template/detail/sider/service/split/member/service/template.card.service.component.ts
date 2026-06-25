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
import {ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {SpecCodeComponent} from '../../../../../../../../../common/form/item/common/code/spec.code.component';
import {
  DescriptionComponent
} from '../../../../../../../../../common/form/item/common/description/description.component';

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
    TranslatePipe,
    SpecCodeComponent,
    DescriptionComponent
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateCardServiceComponent implements OnInit {

  @Input() editable: boolean = false;
  @Input() service!: ServiceTemplate;
  @Input() language!: string;
  @Output() changed = new EventEmitter<void>();
  @Output() removed = new EventEmitter<void>();

  form: FormGroup<{
    iid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
  }>;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      code: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9-]*$/)
      ]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.form.controls.iid.setValue(this.service.iid);
    this.form.controls.code.setValue(this.service.type.name);
    this.form.controls.description.setValue(this.service.description);
  }

  onIIDChanged() {
    this.service.iid = this.form.value.iid || 0;
    this.changed.emit()
  }

  onDescriptionChanged() {
    this.service.description = this.form.value.description || new Map<string, string>();
    this.changed.emit()
  }

  onRemoved() {
    this.removed.emit();

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
}
