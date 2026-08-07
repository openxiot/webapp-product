import {Component, EventEmitter, Input, OnInit, Output, ViewContainerRef, signal} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {DeviceDefinition, NamespaceDefinition, TemplateSummary, Urn, UrnType} from '@openxiot/xiot-core-spec-ts';
import {MainI18nService} from '../../../../../service/i18n.service';
import {MainService} from '../../../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {AccountService} from '../../../../../service/account.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardComponent, NzCardMetaComponent} from 'ng-zorro-antd/card';
import {NamespaceSelectorComponent} from '../../../../../common/dialog/namespace/namespace.selector.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {TemplateSelectorComponent} from './dialog/template/template.selector.component';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {TemplatesOption} from './dialog/template/TemplatesOption';
import {NamespaceOption} from '../../../../../common/dialog/namespace/NamespaceOption';
import {DeviceSelectorComponent} from './dialog/device/device.selector.component';
import {DevicesOption} from './dialog/device/DevicesOption';
import {NzTagModule} from 'ng-zorro-antd/tag';

@Component({
  selector: 'product-template',
  standalone: true,
  templateUrl: './product.template.component.html',
  styleUrl: './product.template.component.less',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzRowDirective,
    NzColDirective,
    NzCardComponent,
    NzCardMetaComponent,
    NzSpinModule,
    NzTagModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ProductTemplateComponent,
      multi: true
    },
    NzModalService
  ]
})
export class ProductTemplateComponent implements OnInit, ControlValueAccessor {

  @Input() updatable: boolean = false;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  private _value!: Urn;

  disabled = false;

  onChange: (value: Urn) => void = () => {
  };
  onTouched: () => void = () => {
  };

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private account: AccountService,
    private service: MainService,
    public i18n: MainI18nService,
    private main: MainService,
    private msg: NzMessageService,
  ) {
  }

  get value(): Urn {
    return this._value;
  }

  set value(val: Urn) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
    }

    this.onTouched();
  }

  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this._value) {
      this._value = obj;

      this.loadNamespaces();
      this.loadDevices();
      this.loadTemplates();
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  //--------------------------------------------------------------------------------
  // 加载名字空间
  //--------------------------------------------------------------------------------
  loadingNamespaces = signal(false);
  loadingDevices = signal(false);
  loadingTemplates = signal(false);
  namespaces = signal<Map<string, NamespaceDefinition>>(new Map<string, NamespaceDefinition>());
  devices = signal<Map<string, DeviceDefinition>>(new Map<string, DeviceDefinition>());
  templates = signal<Map<string, TemplateSummary>>(new Map<string, TemplateSummary>());

  ngOnInit(): void {
    this.loadNamespaces();
    this.loadDevices();
    this.loadTemplates();
  }

  private loadNamespaces() {
    this.loadingNamespaces.set(true);
    this.service.getAllNamespaces(this.account.organization())
      .subscribe({
        next: data => {
          this.namespaces.set(new Map(data.map(item => [item.namespace, item])));
          this.loadingNamespaces.set(false);
        },
        error: error => {
          this.msg.warning(error);
          this.loadingNamespaces.set(false);
        }
      })
  }

  private loadDevices() {
    if (this._value) {
      if (this._value.ns.length > 0) {
        this.loadingDevices.set(true);
        this.service.getDeviceDefinitions(this._value.ns)
          .subscribe({
            next: data => {
              this.devices.set(new Map(data.map(item => [item.type.name, item])));
              this.loadingDevices.set(false);
            },
            error: error => {
              console.log(error);
              this.loadingDevices.set(false);
            }
          })
      }
    }
  }

  private loadTemplates() {
    if (this._value) {
      if (this._value.ns.length > 0) {
        this.loadingTemplates.set(true);
        this.service.getTemplates(this._value.ns)
          .subscribe({
            next: data => {
              this.templates.set(new Map(data.map(item => [item.type.toString(), item])));
              this.loadingTemplates.set(false);
            },
            error: error => {
              console.log(error);
              this.loadingTemplates.set(false);
            }
          })
      }
    }
  }

  protected get CurrentNamespaceTitle(): string {
    const def = this.namespaces().get(this._value.ns);
    if (def) {
      return def.namespace || '?';
    }

    return this._value.ns || '?';
  }

  protected get CurrentNamespaceDescription(): string {
    const def = this.namespaces().get(this._value.ns);
    if (def) {
      return def.description.get(this.i18n.getCurrentLang()) || def.namespace || '?';
    }

    return this._value.ns || '?';
  }

  protected get CurrentDeviceTypeTitle(): string {
    const def = this.devices().get(this._value.name);
    if (def) {
      return def.type.name;
    }

    return '?';
  }

  protected get CurrentDeviceTypeDescription(): string {
    const def = this.devices().get(this._value.name);
    if (def) {
      return def.description.get(this.i18n.getCurrentLang()) || def.type.name;
    }

    return '?';
  }

  protected get CurrentTemplateTitle(): string {
    const template = this.templates().get(this._value.toString());
    if (template) {
      return template.type.name;
    }

    return 'empty';
  }

  protected get CurrentTemplateDescription(): string {
    const template = this.templates().get(this._value.toString());
    if (template) {
      return template.description.get(this.i18n.getCurrentLang()) || template.type.name;
    }

    return this.i18n.translate.instant('空模板');
  }

  protected onClickNamespace() {
    if (this.updatable) {
      const modal = this.modal.create<NamespaceSelectorComponent, NamespaceOption, NamespaceDefinition>({
        nzTitle: this.i18n.translate.instant('请选择名字空间'),
        nzWidth: 800,
        nzContent: NamespaceSelectorComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzData: new NamespaceOption(this._value.ns || '', Array.from(this.namespaces().values())),
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: true,
        nzKeyboard: true
      });

      modal.afterClose.subscribe(result => {
        if (result) {
          this._value.ns = result.namespace;
          this.loadDevices();
          this.loadTemplates();
        }
      });
    }
  }

  protected onClickDeviceType() {
    if (this.updatable) {
      if (this._value.ns.length > 0) {
        const modal = this.modal.create<DeviceSelectorComponent, DevicesOption, Urn>({
          nzTitle: this.i18n.translate.instant('请选择设备类型'),
          nzWidth: 1024,
          nzContent: DeviceSelectorComponent,
          nzViewContainerRef: this.viewContainerRef,
          nzData: new DevicesOption(Array.from(this.devices().values()), this._value.name),
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: true,
          nzKeyboard: true
        });

        modal.afterClose.subscribe(result => {
          if (result) {
            this.value = result;
            this.changed.emit();
          }
        });
      }
    }
  }

  protected onClickTemplate() {
    if (this.updatable) {
      if (this._value.name.length > 0) {

        const templates = Array.from(this.templates().values()).filter(item => item.type.name === this._value.name);
        const deviceType = Urn.create(this.value.ns, UrnType.DEVICE, this.value.name, this.value.shortUUID());

        const modal = this.modal.create<TemplateSelectorComponent, TemplatesOption, Urn>({
          nzTitle: this.i18n.translate.instant('请选择模板'),
          nzWidth: 1024,
          nzContent: TemplateSelectorComponent,
          nzViewContainerRef: this.viewContainerRef,
          nzData: new TemplatesOption(templates, deviceType, this._value.model),
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: true,
          nzKeyboard: true
        });

        modal.afterClose.subscribe(result => {
          if (result) {
            this.value = result;
            this.changed.emit();
          }
        });
      }
    }
  }
}
