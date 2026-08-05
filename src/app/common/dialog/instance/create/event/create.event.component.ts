import {Component, inject, OnInit, signal} from '@angular/core';
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
import {DeviceInstanceDescriptionComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/description/device.instance.description.component';
import {DeviceInstanceIdComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/iid/device.instance.id.component';
import {DeviceInstanceNameComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/name/device.instance.name.component';
import {DeviceInstanceNamespaceComponent} from '../../../../../pages/content/product/detail/instance/detail/service/detail/property/namespace/device.instance.namespace.component';
import {
  LifeCycle,
  Event,
  ObjectWithLifecycle,
  PropertyDefinition,
  EventDefinition,
  Service, ServiceType, EventType
} from '@openxiot/xiot-core-spec-ts';
import {NzContentComponent, NzLayoutComponent, NzSiderComponent} from 'ng-zorro-antd/layout';
import {NzMenuDirective, NzMenuDividerDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {MainService} from '../../../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzFlexModule} from 'ng-zorro-antd/flex';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';
import {EventOption} from './EventOption';
import {MainI18nService} from '../../../../../service/i18n.service';
import {DescriptionComponent} from '../../../../form/item/common/description/description.component';

@Component({
  selector: 'create-event',
  styleUrl: './create.event.component.less',
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
    DeviceInstanceIdComponent,
    DeviceInstanceNamespaceComponent,
    NzContentComponent,
    NzLayoutComponent,
    NzMenuDirective,
    NzMenuDividerDirective,
    NzMenuItemComponent,
    NzSiderComponent,
    NzSpinComponent,
    NzFlexModule,
    TranslatePipe,
    DescriptionComponent,
    DeviceInstanceNameComponent,
  ],
  providers: [],
})
export class CreateEventComponent implements OnInit {

  protected readonly LifeCycle = LifeCycle;

  readonly #modal = inject(NzModalRef);
  readonly option: EventOption = inject(NZ_MODAL_DATA);

  form: FormGroup<{
    iid: FormControl<number>,
    ns: FormControl<string>,
    code: FormControl<string>,
    description: FormControl<Map<string, string>>,
  }>;

  custom: Event;
  events = signal<Event[]>([]);
  selected: Event;

  loading = signal(false);
  definitions: EventDefinition[] = [];

  loadingProperties = signal(true);
  properties: Map<string, PropertyDefinition> = new Map<string, PropertyDefinition>();

  constructor(
    public i18n: MainI18nService,
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

    this.custom = this.createCustomEvent();
    this.selected = this.custom;
  }

  private createCustomEvent(): Event {
    const org = this.option.type.organization || 'org';
    const model = this.option.type.model || 'model';
    const version = this.option.type.version || 0;
    const type = new EventType(`urn:${org}:event:unnamed:00000000:${org}:${model}:${version}`);
    const description = new Map<string, string>();
    description.set(this.i18n.getCurrentLang(), this.i18n.translate.instant('自定义事件'));
    return new Event(this.option.iid, type, description, [])
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadProperties();
  }

  private loadEvents(): void {
    this.loading.set(true);
    this.main.getEventDefinitions(this.option.type.ns)
      .subscribe({
        next: data => {
          this.definitions = data;

          this.events.set(this.definitions
            .filter(x => x.lifecycle === LifeCycle.RELEASED)
            .map(x => {
              return new Event(this.option.iid, x.type, x.description, []);
            }));

          this.initFormData();
        },
        error: error => {
          console.log(error);

          this.initFormData();

          this.loading.set(false);
        }
      })
  }

  private loadProperties(): void {
    this.loadingProperties.set(true);
    this.main.getPropertyDefinitions(this.option.type.ns)
      .subscribe({
        next: data => {
          this.properties = new Map(data.map(item => [item.type.name, item]));
          this.loadingProperties.set(false);
        },
        error: error => {
          console.log(error);
          this.loadingProperties.set(false);
        }
      })
  }

  initFormData(): void {
    this.loading.set(true);

    const description: Map<string, string> = new Map<string, string>();
    description.set(this.i18n.getCurrentLang(), this.selected.description.get(this.i18n.getCurrentLang()) || '');

    this.form.controls.iid.setValue(this.selected.iid);
    this.form.controls.ns.setValue(this.selected.type.ns);
    this.form.controls.code.setValue(this.selected.type.name);
    this.form.controls.description.setValue(description);

    this.loading.set(false);
  }

  cancel(): void {
    this.#modal.destroy(undefined);
  }

  ok(): void {
    this.selected.iid = this.form.controls.iid.value;
    this.selected.type.ns = this.form.controls.ns.value;
    this.selected.type.name = this.form.controls.code.value;
    this.selected.description = this.form.controls.description.value;

    this.#modal.destroy(this.selected);
  }

  protected onClickEvent(a: Event) {
    this.selected = a;
    this.initFormData();
  }

  protected onIIDChanged(): void {
    console.log('onIIDChanged');

    if (! this.loading()) {
      this.selected.iid = this.form.controls.iid.value;
    }
  }

  protected onCodeChanged(): void {
    console.log('onCodeChanged');

    if (! this.loading()) {
      this.selected.type.name = this.form.controls.code.value;
    }
  }

  protected onDescriptionChanged(): void {
    console.log('onDescriptionChanged');

    if (! this.loading()) {
      this.selected.description = this.form.controls.description.value;
    }
  }
}
