import {Component, Input} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzCascaderComponent, NzCascaderOption} from 'ng-zorro-antd/cascader';
import {LifeCycle} from '@openxiot/xiot-core-spec-ts';
import {NzDividerModule} from 'ng-zorro-antd/divider';

@Component({
  selector: 'product-basic-protocol',
  standalone: true,
  templateUrl: './product.basic.protocol.component.html',
  styleUrls: ['./product.basic.protocol.component.less'],
  imports: [
    FormsModule,
    NzCascaderComponent,
    ReactiveFormsModule,
    NzDividerModule
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

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;

  nzOptions: NzCascaderOption[] = [
    {
      value: 'Directly',
      label: '直连设备',
      children: [
        {
          value: 'wifi',
          label: 'WiFi',
          isLeaf: true
        },
        {
          value: 'wifi+ble',
          label: 'WiFi + BLE',
          isLeaf: true
        },
        {
          value: 'ethernet',
          label: '以太网',
          isLeaf: true
        },
        {
          value: 'ethernet+ble',
          label: '以太网 + BLE',
          isLeaf: true
        }
      ]
    },
    {
      value: 'Non-Directly',
      label: '非直连设备',
      children: [
        {
          value: 'btmesh',
          label: '蓝牙Mesh',
          isLeaf: true
        },
        {
          value: 'zigbee',
          label: 'Zigbee',
          isLeaf: true
        },
        {
          value: 'knx',
          label: 'KNX',
          isLeaf: true
        },
        {
          value: '485',
          label: '485',
          isLeaf: true
        },
        {
          value: 'can',
          label: 'CAN总线',
          isLeaf: true
        },
        {
          value: 'lora',
          label: 'LORA',
          isLeaf: true
        },
        {
          value: 'other',
          label: '其他',
          isLeaf: true
        }
      ]
    }
  ];

  private _values: string[] = [];

  disabled = false;

  onChange: (value: string[]) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
  }

  get value(): string[] {
    return this._values;
  }

  set value(val: string[]) {
    if (val !== this._values) {
      this._values = val;
      this.onChange(val);
    }

    this.onTouched();
  }

  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this._values) {
      this._values = obj;
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

  get protocolCategory(): string {
    switch (this._values[0]) {
      case 'Directly':
        return '直连设备'

      case 'Non-Directly':
        return '非直连设备'

      default:
        return '';
    }
  }

  get protocolName(): string {
    switch (this._values[1]) {
      case 'wifi':
        return 'WiFi';

      case 'wifi+ble':
        return 'WiFi + BLE';

      case 'ethernet':
        return '以太网';

      case 'ethernet+ble':
        return '以太网 + BLE';

      case 'btmesh':
        return '蓝牙MESH';

      case 'zigbee':
        return 'Zigbee';

      case 'knx':
        return 'KNX';

      case '485':
        return '485';

      case 'can':
        return 'CAN';

      case 'lora':
        return 'LORA';

      case 'other':
        return '其他';

      default:
        return '';
    }
  }

  protected readonly LifeCycle = LifeCycle;
}
