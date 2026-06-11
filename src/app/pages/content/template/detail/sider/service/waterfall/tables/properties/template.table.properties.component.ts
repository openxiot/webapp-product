import {Component, Input, ViewContainerRef} from '@angular/core';
import {DataFormat, Property, Service, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzTableComponent, NzTableModule} from "ng-zorro-antd/table";
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {PropertyWriterComponent} from './write/property.writer.component';
import {IPropertyData} from './IPropertyData';
import {NzModalService} from 'ng-zorro-antd/modal';
import {PropertyReaderComponent} from './read/property.reader.component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {FormsModule} from '@angular/forms';
import {EditStringComponent} from '../../../../../common/dialog/edit/string/edit.string.component';
import {EditableString} from '../../../../../common/dialog/edit/string/EditableString';
import {ConfirmComponent} from '../../../../../common/dialog/confirm/confirm.component';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {PropertyValueComponent} from './property-value/property-value.component';
import {PropertyMemberComponent} from './member/property-member.component';
import {EditableProperty} from '../../../../../common/dialog/edit/property/EditableProperty';
import {EditPropertyComponent} from '../../../../../common/dialog/edit/property/edit.property.component';

@Component({
  selector: 'template-table-properties',
  templateUrl: './template.table.properties.component.html',
  styleUrls: ['./template.table.properties.component.less'],
  standalone: true,
  imports: [
    NzIconModule,
    NzSpaceModule,
    NzTableModule,
    NzTableComponent,
    NzTagModule,
    NzButtonComponent,
    NzCheckboxModule,
    FormsModule,
    NzDividerComponent,
    PropertyValueComponent,
    PropertyMemberComponent,
  ],
  providers: [
    NzModalService
  ]
})
export class TemplateTablePropertiesComponent {

  @Input() version: boolean = false;
  @Input() service!: ServiceTemplate;
  @Input() language: string = 'zh-CN';
  // @Output() changed = new EventEmitter<Property>();
  // @Output() removed = new EventEmitter<Property>();

  expand: boolean = true;

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private msg: NzMessageService
  ) {
    console.log("PropertiesControllerComponent.constructor");
  }

  setProperty(property: Property) {
    // 创建完就显示，不需要拿返回值。
    // this.modal.create<PropertyWriterComponent, IPropertyData>({
    //   nzTitle: property.description.get('zh-CN'),
    //   nzContent: PropertyWriterComponent,
    //   nzViewContainerRef: this.viewContainerRef,
    //   nzData: {
    //     did: '',
    //     service: this.service,
    //     property: property
    //   },
    //   nzFooter: [
    //     {
    //       label: '取消',
    //       onClick: component => component!.destroyModal()
    //     },
    //     {
    //       label: '写属性',
    //       danger: true,
    //       type: 'primary',
    //       onClick: component => component!.doWrite()
    //     }
    //   ],
    //   nzDraggable: false,
    //   nzWidth: 600
    // });

    // modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));
    // // Return a result when closed
    // modal.afterClose.subscribe(result => console.log('[afterClose] The result is:', result));
    // const instance = modal.getContentComponent();
    // delay until modal instance created
    // setTimeout(() => {
    //   instance.subtitle = 'sub title is changed';
    // }, 2000);
  }

  getProperty(property: Property) {
    // this.modal.create<PropertyReaderComponent, IPropertyData>({
    //   nzTitle: property.description.get('zh-CN'),
    //   nzContent: PropertyReaderComponent,
    //   nzViewContainerRef: this.viewContainerRef,
    //   nzData: {
    //     did: '',
    //     service: this.service,
    //     property: property
    //   },
    //   nzFooter: [
    //     {
    //       label: '取消',
    //       onClick: component => component!.destroyModal()
    //     },
    //     {
    //       label: '读属性',
    //       danger: true,
    //       type: 'primary',
    //       onClick: component => component!.doRead()
    //     }
    //   ],
    //   nzDraggable: false,
    //   nzWidth: 600
    // });
  }

  onExpand() {
    this.expand = ! this.expand;
  }

  onEdit(p: Property) {
    // const modal = this.modal.create<EditPropertyComponent, EditableProperty, Service>({
    //   nzTitle: '修改属性',
    //   nzWidth: 800,
    //   nzContent: EditPropertyComponent,
    //   nzViewContainerRef: this.viewContainerRef,
    //   nzData: new EditableProperty(this.service, p),
    //   nzFooter: [
    //     {
    //       label: '修改',
    //       danger: true,
    //       type: 'primary',
    //       disabled: component => component!.disabled || false,
    //       onClick: component => component!.ok()
    //     }
    //   ],
    //   nzDraggable: true,
    // });
    //
    // modal.afterClose.subscribe(result => {
    //   if (result) {
    //   }
    // });
  }

  onRemove(p: Property) {
    const modal = this.modal.create<ConfirmComponent, string, string>({
      nzTitle: '您真的要删除这个属性吗？',
      nzContent: ConfirmComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: p.description.get(this.language),
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

    // modal.afterClose.subscribe(result => {
    //   if (result) {
    //     this.removed.emit(p);
    //   }
    // });
  }

  onEditName(p: Property) {
    const modal = this.modal.create<EditStringComponent, EditableString, string>({
      nzTitle: '修改属性代码',
      nzContent: EditStringComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new EditableString(p.type.name),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '修改',
          danger: true,
          type: 'primary',
          disabled: component => component!.disabled || false,
          onClick: component => component!.ok()
        }
      ],
      nzDraggable: true,
    });

    // modal.afterClose.subscribe(result => {
    //   if (result) {
    //     p.type.name = result;
    //     this.changed.emit(p);
    //   }
    // });
  }

  onEditDescription(p: Property) {
    const modal = this.modal.create<EditStringComponent, EditableString, string>({
      nzTitle: '修改属性描述',
      nzContent: EditStringComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new EditableString(p.description.get(this.language)),
      nzFooter: [
        {
          label: '取消',
          onClick: component => component!.cancel()
        },
        {
          label: '修改',
          danger: true,
          type: 'primary',
          disabled: component => component!.disabled || false,
          onClick: component => component!.ok()
        }
      ],
      nzDraggable: true,
    });

    // modal.afterClose.subscribe(result => {
    //   if (result) {
    //     p.description.set(this.language, result);
    //     this.changed.emit(p);
    //   }
    // });
  }

  getWidthConfig() {
    return this.version ?
      ['32px', '128px', '128px', '60px', '80px', '40px', '80px', '32px', '32px'] :
      ['32px', '128px', '128px', '60px', '80px', '40px', '112px', '32px'];
  }

  getFormatLabel(format: DataFormat) {
    switch (format) {
      case 'bool':
        return '布尔值';

      case 'uint8':
        return '无符号8位整型';

      case 'uint16':
        return '无符号16位整型';

      case 'uint32':
        return '无符号32位整型';

      case 'int8':
        return '8位整型';

      case 'int16':
        return '16位整型';

      case 'int32':
        return '32位整型';

      case 'int64':
        return '64位整型';

      case 'float':
        return '浮点数';

      case 'string':
        return '字符串';

      case 'hex':
        return '16进制字符串';

      case 'tlv8':
        return 'TLV8字符串';

      case 'combination':
        return '组合值';

      default:
        return '';
    }
  }
}
