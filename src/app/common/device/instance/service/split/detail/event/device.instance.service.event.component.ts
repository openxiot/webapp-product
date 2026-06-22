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
import {Service, Event, Argument, LifeCycle} from '@openxiot/xiot-core-spec-ts';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ConfirmComponent} from '../../../../../../dialog/confirm/confirm.component';
import {MainI18nService} from '../../../../../../../service/i18n.service';
import {DeviceInstanceNamespaceComponent} from '../property/namespace/device.instance.namespace.component';
import {DeviceInstanceIdComponent} from '../property/iid/device.instance.id.component';
import {DeviceInstanceNameComponent} from '../property/name/device.instance.name.component';
import {DeviceInstanceDescriptionComponent} from '../property/description/device.instance.description.component';
import {DeviceInstanceArgumentsComponent} from '../action/arguments/device.instance.arguments.component';
import {areMapsEqual} from '../../../../../../../typedef/utils/MapUtils';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'device-instance-service-event',
  templateUrl: './device.instance.service.event.component.html',
  styleUrls: ['./device.instance.service.event.component.less'],
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
    NzFlexDirective,
    DeviceInstanceNamespaceComponent,
    DeviceInstanceIdComponent,
    DeviceInstanceNameComponent,
    DeviceInstanceDescriptionComponent,
    DeviceInstanceArgumentsComponent,
    TranslatePipe
  ],
  providers: [
    NzModalService
  ],
})
export class DeviceInstanceServiceEventComponent implements OnChanges {

  protected readonly LifeCycle = LifeCycle;
  private loading: boolean = false;

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Input() service!: Service;
  @Input() event!: Event;
  @Input() language!: string;
  @Output() removed = new EventEmitter<Event>();
  @Output() changed = new EventEmitter<Event>();

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
    arguments: FormControl<Argument[]>,
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
      code: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
      arguments: this.fb.control<Argument[]>([]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event']) {
      this.reload();
    }
  }

  private reload() {
    this.loading = true;

    this.form.controls.iid.setValue(this.event.iid);
    this.form.controls.ns.setValue(this.event.type.ns);
    this.form.controls.code.setValue(this.event.type.name);
    this.form.controls.description.setValue(this.event.description);
    this.form.controls.arguments.setValue(this.event.getArguments());

    this.loading = false;
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

    modal.afterClose.subscribe(result => {
      if (result) {
        this.removed.emit(this.event);
      }
    });
  }

  protected get updatable(): boolean {
    if (this.event) {
      return this.event.type.ns === this.event.type.organization;
    }

    return false;
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');

    if (! this.loading) {
      if (this.event.iid !== this.form.controls.iid.value) {
        this.event.iid = this.form.controls.iid.value;
        this.changed.emit(this.event);
      }
    }
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');

    if (!this.loading) {
      if (this.event.type.name !== this.form.controls.code.value) {
        this.event.type.name = this.form.controls.code.value;
        this.changed.emit(this.event);
      }
    }
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');

    if (!this.loading) {
      const value: Map<string, string> = this.form.controls.description.value;
      if (! areMapsEqual(this.event.description, value)) {
        this.event.description = value;
        this.changed.emit(this.event);
      }
    }
  }

  protected onArgumentsChanged(): void {
    console.log('onArgumentsChanged');

    if (!this.loading) {
      this.event.arguments.clear();

      for (let arg of this.form.controls.arguments.value) {
        this.event.arguments.set(arg.piid, arg);
      }

      this.changed.emit(this.event);
    }
  }
}
