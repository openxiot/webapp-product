import {Component, computed, inject, Input, signal} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzCascaderComponent, NzCascaderOption} from 'ng-zorro-antd/cascader';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {MainI18nService} from '../../../../../service/i18n.service';

/**
 * 协议选项：value = 落库代码；携带 label 的为通用专名（不随语言变化），
 * 携带 key 的走 i18n（键为中文原文，按当前 UI 语言翻译）。
 */
interface ProtocolNode {
  value: string;
  label?: string;
  key?: string;
  children?: ProtocolNode[];
}

@Component({
  selector: 'product-basic-protocol',
  standalone: true,
  templateUrl: './product.basic.protocol.component.html',
  styleUrl: './product.basic.protocol.component.less',
  imports: [
    FormsModule,
    NzCascaderComponent,
    ReactiveFormsModule,
    NzTagModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ProductBasicProtocolComponent,
      multi: true
    }
  ]
})
export class ProductBasicProtocolComponent implements ControlValueAccessor {

  @Input() updatable: boolean = false;

  private readonly i18n = inject(MainI18nService);

  /** 协议分类树：value=类别/协议代码，label=通用专名，key=i18n 键。 */
  private readonly protocolTree: ProtocolNode[] = [
    {
      value: 'Directly',
      key: '直连设备',
      children: [
        {value: 'wifi', label: 'WiFi'},
        {value: 'wifi+ble', label: 'WiFi + BLE'},
        {value: 'ethernet', key: '以太网'},
        {value: 'ethernet+ble', key: '以太网 + BLE'},
        {value: '4g', label: '4G'},
        {value: '4g+ble', label: '4G + BLE'}
      ]
    },
    {
      value: 'Non-Directly',
      key: '非直连设备',
      children: [
        {value: 'btmesh', key: '蓝牙Mesh'},
        {value: 'zigbee', label: 'Zigbee'},
        {value: 'knx', label: 'KNX'},
        {value: '485', label: '485'},
        {value: 'can', key: 'CAN总线'},
        {value: 'lora', label: 'LORA'},
        {value: 'other', key: '其他'}
      ]
    }
  ];

  private _values = signal<string[]>([]);

  /** nz-cascader 选项：按当前 UI 语言实时翻译。 */
  readonly nzOptions = computed<NzCascaderOption[]>(() => this.toOptions(this.protocolTree));

  /** 只读态：协议分类标签（如「直连设备」）。 */
  readonly categoryLabel = computed(() => this.textOf(this.categoryNode(this._values()[0])));

  /** 只读态：协议名称标签（如「WiFi」）。 */
  readonly nameLabel = computed(() => {
    const leaf = this.categoryNode(this._values()[0])
      ?.children?.find(child => child.value === this._values()[1]);
    return leaf ? this.textOf(leaf) : '';
  });

  disabled = false;

  onChange: (value: string[]) => void = () => {};
  onTouched: () => void = () => {};

  get value(): string[] {
    return this._values();
  }

  set value(val: string[]) {
    if (val !== this._values()) {
      this._values.set(val);
      this.onChange(val);
    }

    this.onTouched();
  }

  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this._values()) {
      this._values.set(obj);
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

  /** 节点显示文本：专名直显，否则按当前语言翻译。 */
  private textOf(node: ProtocolNode | undefined): string {
    if (!node) {
      return '';
    }

    if (node.label) {
      return node.label;
    }

    return node.key ? this.translateKey(node.key) : node.value;
  }

  /** 读取翻译键；同时读取 currentLang signal，语言切换即触发重算。 */
  private translateKey(key: string): string {
    void this.i18n.currentLang();
    return this.i18n.translate.instant(key);
  }

  private toOptions(nodes: ProtocolNode[]): NzCascaderOption[] {
    return nodes.map(node => {
      if (node.children) {
        return {
          value: node.value,
          label: this.textOf(node),
          children: this.toOptions(node.children)
        };
      }

      return {
        value: node.value,
        label: this.textOf(node),
        isLeaf: true
      };
    });
  }

  private categoryNode(value: string): ProtocolNode | undefined {
    return this.protocolTree.find(node => node.value === value);
  }
}
