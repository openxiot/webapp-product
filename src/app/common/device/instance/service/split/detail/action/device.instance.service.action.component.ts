import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
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
import {Action, Argument, LifeCycle, Service} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ConfirmComponent} from '../../../../../../dialog/confirm/confirm.component';
import {DeviceInstanceNamespaceComponent} from '../property/namespace/device.instance.namespace.component';
import {DeviceInstanceIdComponent} from '../property/iid/device.instance.id.component';
import {DeviceInstanceNameComponent} from '../property/name/device.instance.name.component';
import {DeviceInstanceDescriptionComponent} from '../property/description/device.instance.description.component';
import {DeviceInstanceArgumentsComponent} from './arguments/device.instance.arguments.component';
import {areMapsEqual} from '../../../../../../../typedef/utils/MapUtils';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'device-instance-service-action',
  templateUrl: './device.instance.service.action.component.html',
  styleUrls: ['./device.instance.service.action.component.less'],
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
    DeviceInstanceNamespaceComponent,
    DeviceInstanceIdComponent,
    DeviceInstanceNameComponent,
    DeviceInstanceDescriptionComponent,
    DeviceInstanceArgumentsComponent,
    NzFlexDirective,
    TranslatePipe,
  ],
  providers: [
    NzModalService
  ],
})
export class DeviceInstanceServiceActionComponent implements OnChanges {

  protected readonly LifeCycle = LifeCycle;
  private loading: boolean = false;

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Input() service!: Service;
  @Input() action!: Action;
  @Input() language!: string;
  @Output() removed = new EventEmitter<Action>();
  @Output() changed = new EventEmitter<Action>();

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    argumentsIn: FormControl<Argument[]>,
    argumentsOut: FormControl<Argument[]>,
  }>;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      argumentsIn: this.fb.control<Argument[]>([]),
      argumentsOut: this.fb.control<Argument[]>([]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['action']) {
      this.reload();
    }
  }

  private reload() {
    this.loading = true;

    this.form.controls.iid.setValue(this.action.iid);
    this.form.controls.ns.setValue(this.action.type.ns);
    this.form.controls.code.setValue(this.action.type.name);
    this.form.controls.description.setValue(this.action.description);
    this.form.controls.argumentsIn.setValue(this.action.getArgumentsIn());
    this.form.controls.argumentsOut.setValue(this.action.getArgumentsOut());

    this.loading = false;
  }

  onRemoved() {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: '您真的要删除这个方法吗？',
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: this.action.description.get('zh-CN'),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '确认',
          danger: true,
          type: 'primary',
          onClick: component => component!.ok()
        }
      ],
    });

    modal.afterClose.subscribe(result => {
      if (result) {
        this.removed.emit(this.action);
      }
    });
  }

  protected get updatable(): boolean {
    if (this.action) {
      return this.action.type.ns === this.action.type.organization;
    }

    return false;
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');

    if (! this.loading) {
      if (this.action.iid !== this.form.controls.iid.value) {
        this.action.iid = this.form.controls.iid.value;
        this.changed.emit(this.action);
      }
    }
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');

    if (!this.loading) {
      if (this.action.type.name !== this.form.controls.code.value) {
        this.action.type.name = this.form.controls.code.value;
        this.changed.emit(this.action);
      }
    }
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');

    if (!this.loading) {
      const value: Map<string, string> = this.form.controls.description.value;
      if (! areMapsEqual(this.action.description, value)) {
        this.action.description = value;
        this.changed.emit(this.action);
      }
    }
  }

  protected onArgumentsInChanged(): void {
    console.log('onArgumentsInChanged');

    if (!this.loading) {
      this.action.in.clear();

      for (let arg of this.form.controls.argumentsIn.value) {
        this.action.in.set(arg.piid, arg);
      }

      this.changed.emit(this.action);
    }
  }

  protected onArgumentsOutChanged(): void {
    console.log('onArgumentsOutChanged');

    if (!this.loading) {
      this.action.out.clear();

      for (let arg of this.form.controls.argumentsOut.value) {
        this.action.out.set(arg.piid, arg);
      }

      this.changed.emit(this.action);
    }
  }
}
