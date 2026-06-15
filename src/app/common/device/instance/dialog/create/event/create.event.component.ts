import {Component, inject, OnInit} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {DeviceInstanceDescriptionComponent} from '../../../service/split/detail/property/description/device.instance.description.component';
import {DeviceInstanceIdComponent} from '../../../service/split/detail/property/iid/device.instance.id.component';
import {DeviceInstanceNameComponent} from '../../../service/split/detail/property/name/device.instance.name.component';
import {DeviceInstanceNamespaceComponent} from '../../../service/split/detail/property/namespace/device.instance.namespace.component';
import {
  LifeCycle,
  Event,
  ObjectWithLifecycle,
  PropertyDefinition,
  EventDefinition,
  Service
} from '@openxiot/xiot-core-spec-ts';
import {NzContentComponent, NzLayoutComponent, NzSiderComponent} from 'ng-zorro-antd/layout';
import {NzMenuDirective, NzMenuDividerDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {MainService} from '../../../../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzFlexModule} from 'ng-zorro-antd/flex';
import {AccountService} from '../../../../../../service/account.service';

@Component({
  selector: 'create-event',
  styleUrls: ['./create.event.component.less'],
  templateUrl: './create.event.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzColDirective,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzRowDirective,
    DeviceInstanceDescriptionComponent,
    DeviceInstanceIdComponent,
    DeviceInstanceNameComponent,
    DeviceInstanceNamespaceComponent,
    NzContentComponent,
    NzLayoutComponent,
    NzMenuDirective,
    NzMenuDividerDirective,
    NzMenuItemComponent,
    NzSiderComponent,
    NzSpinComponent,
    NzFlexModule,
  ],
  providers: [],
})
export class CreateEventComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;

  readonly #modal = inject(NzModalRef);
  readonly data: Event = inject(NZ_MODAL_DATA);

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
  }>;

  loading: boolean = false;
  events: Event[] = [];
  current: Event;

  definitions: EventDefinition[] = [];

  loadingProperties: boolean = true;
  properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  constructor(
    private account: AccountService,
    private main: MainService,
    private msg: NzMessageService,
    private fb: NonNullableFormBuilder
  ) {
    this.form = this.fb.group({
      iid: this.fb.control(0, [Validators.required]),
      ns: this.fb.control('', [Validators.required]),
      code: this.fb.control('', [Validators.required]),
      description: this.fb.control<Map<string, string>>(new Map<string, string>(), [Validators.required]),
    });

    this.current = this.data;
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadProperties();
  }

  private loadEvents(): void {
    this.loading = true;
    this.main.getSpecEvents(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.definitions = data;

          this.events = this.definitions
            .filter(x => x.lifecycle === LifeCycle.RELEASED)
            .map(x => {
              return new Event(this.data.iid, x.type, x.description, []);
            });

          this.loading = false;

          this.initFormData();
        },
        error: error => {
          this.msg.warning('Failed to getSpecServices: ', error);
        }
      })
  }

  private loadProperties(): void {
    this.loadingProperties = true;
    this.main.getSpecProperties(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.properties = new Map(data.map(item => [item.type.name, item]));
          this.loadingProperties = false;
        },
        error: error => {
          this.msg.warning('Failed to getSpecProperties: ', error);
        }
      })
  }

  initFormData(): void {
    this.loading = true;

    this.form.controls.iid.setValue(this.data.iid);
    this.form.controls.ns.setValue(this.data.type.ns);
    this.form.controls.code.setValue(this.data.type.name);
    this.form.controls.description.setValue(this.data.description);

    this.loading = false;
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.data.iid = this.form.controls.iid.value;
    this.data.type.ns = this.form.controls.ns.value;
    this.data.type.value = this.current.type.value;
    this.data.type.name = this.form.controls.code.value;
    this.data.description = this.form.controls.description.value;

    this.#modal.destroy(this.data);
  }

  protected onClickEvent(a: Event) {
    this.loading = true;
    this.current = a;

    this.form.controls.iid.setValue(a.iid);
    this.form.controls.ns.setValue(a.type.ns);
    this.form.controls.code.setValue(a.type.name);
    this.form.controls.description.setValue(a.description);

    this.loading = false;
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');

    if (! this.loading) {
      this.data.iid = this.form.controls.iid.value;
    }
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');

    if (! this.loading) {
      this.data.type.name = this.form.controls.code.value;
    }
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');

    if (! this.loading) {
      this.data.description = this.form.controls.description.value;
    }
  }
}
