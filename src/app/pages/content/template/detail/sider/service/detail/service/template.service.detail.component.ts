import {Component, effect, EventEmitter, input, Output} from '@angular/core';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';

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
import {SpecCodeComponent} from '../../../../../../../../common/form/item/common/code/spec.code.component';
import {DescriptionComponent} from '../../../../../../../../common/form/item/common/description/description.component';
import {SpecIidComponent} from '../../../../../../../../common/form/item/common/iid/spec.iid.component';
import {SpecAddableComponent} from '../../../../../../../../common/form/item/common/addable/spec.addable.component';
import {SpecRequiredComponent} from '../../../../../../../../common/form/item/common/required/spec.required.component';
import {TemplateOp} from '../../../../../../../../typedef/template/TemplateEditor';

@Component({
  selector: 'template-service-detail',
  templateUrl: './template.service.detail.component.html',
  styleUrl: './template.service.detail.component.less',
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
    DescriptionComponent,
    SpecIidComponent,
    SpecAddableComponent,
    SpecRequiredComponent
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateServiceDetailComponent {

  editable = input(false);
  service = input.required<ServiceTemplate>();
  @Output() op = new EventEmitter<TemplateOp>();

  form: FormGroup<{
    required: FormControl<boolean>,
    iid: FormControl<number>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    propertyAddable: FormControl<boolean>,
    actionAddable: FormControl<boolean>,
    eventAddable: FormControl<boolean>
  }>;

  /** 已加载的服务 iid：只在服务切换 / 服务自身 iid 被改时 reload，同 iid 自提交不复位表单。 */
  private loadedIid: number | undefined = undefined;

  constructor(
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      required: this.fb.control(true, [Validators.required]),
      iid: this.fb.control(0, [Validators.required]),
      code: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-z][a-z0-9-]*$/)
      ]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      propertyAddable: this.fb.control(true, [Validators.required]),
      actionAddable: this.fb.control(true, [Validators.required]),
      eventAddable: this.fb.control(true, [Validators.required]),
    });

    effect(() => {
      const s = this.service();
      if (this.loadedIid !== s.iid) {
        this.loadedIid = s.iid;
        this.reload(s);
      }
    });
  }

  private reload(service: ServiceTemplate) {
    this.form.controls.required.setValue(service.required);
    this.form.controls.iid.setValue(service.iid);
    this.form.controls.code.setValue(service.type.name);
    this.form.controls.description.setValue(service.description);
    this.form.controls.propertyAddable.setValue(service.propertyAddable);
    this.form.controls.actionAddable.setValue(service.actionAddable);
    this.form.controls.eventAddable.setValue(service.eventAddable);
  }

  protected onRequiredChanged() {
    this.op.emit({
      kind: 'updateService',
      serviceIid: this.service().iid,
      patch: {required: this.form.value.required || false},
    });
  }

  protected onIIDChanged() {
    this.op.emit({
      kind: 'updateService',
      serviceIid: this.service().iid,
      patch: {iid: this.form.value.iid || 0},
    });
  }

  protected onDescriptionChanged() {
    this.op.emit({
      kind: 'updateService',
      serviceIid: this.service().iid,
      patch: {description: this.form.value.description || new Map<string, string>()},
    });
  }

  protected onPropertyAddableChanged() {
    this.op.emit({
      kind: 'updateService',
      serviceIid: this.service().iid,
      patch: {propertyAddable: this.form.value.propertyAddable || false},
    });
  }

  protected onActionAddableChanged() {
    this.op.emit({
      kind: 'updateService',
      serviceIid: this.service().iid,
      patch: {actionAddable: this.form.value.actionAddable || false},
    });
  }

  protected onEventAddable() {
    this.op.emit({
      kind: 'updateService',
      serviceIid: this.service().iid,
      patch: {eventAddable: this.form.value.eventAddable || false},
    });
  }

  onRemoved() {
    this.op.emit({kind: 'removeService', serviceIid: this.service().iid});
  }
}
