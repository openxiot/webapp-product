import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzTooltipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzInputNumberComponent} from 'ng-zorro-antd/input-number';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {ArgumentDefinition, PropertyDefinition} from '@openxiot/xiot-core-spec-ts';
import {NzModalService} from 'ng-zorro-antd/modal';
import {PropertyDefinitionSelector} from '../../../../../dialog/definition/select/property/PropertyDefinitionSelector';
import {PropertyDefinitionSelectComponent} from '../../../../../dialog/definition/select/property/property.definition.select.component';
import {TranslatePipe} from '@ngx-translate/core';
import {MainI18nService} from '../../../../../../service/i18n.service';

@Component({
  selector: 'definition-arguments',
  templateUrl: './definition.arguments.component.html',
  styleUrl: './definition.arguments.component.less',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzTooltipModule,
    NzIconModule,
    NzTagModule,
    NzInputNumberComponent,
    NzSpaceModule,
    NzRowDirective,
    NzColDirective,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DefinitionArgumentsComponent,
      multi: true
    },
    NzModalService
  ]
})
export class DefinitionArgumentsComponent implements OnInit, ControlValueAccessor, OnChanges {

  @Input() updatable: boolean = true;
  @Input() properties: PropertyDefinition[] = [];
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  // 组件内部维护的值
  arguments: ArgumentDefinition[] = [];

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: ArgumentDefinition[]) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    public i18n: MainI18nService
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges: ', changes);
  }

  // --- ControlValueAccessor 接口方法 ---

  // 外部程序设置表单值（如 patchValue、setValue）时，Angular 会调用此方法
  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this.arguments) {
      this.arguments = obj;
    }
  }

  // 注册变化回调：Angular 提供给你一个函数，当内部值变化时，你需要调用它来通知外部
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // 注册触摸回调：Angular 提供给你一个函数，当组件被触摸（如blur）时，你需要调用它
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // 当表单控件的禁用状态变更时（如调用 control.disable()），Angular 会调用此方法
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onChanged() {
    this.onChange(this.arguments);
    this.changed.emit();
  }

  protected getDescription(arg: ArgumentDefinition): string {
    const p = this.properties.find(x => x.type.name === arg.type.name);
    if (p) {
        return p.description.get(this.i18n.getCurrentLang()) || p.description.get('en-US') || '';
    }

    return '?';
  }

  protected removeArgument(arg: ArgumentDefinition): void {
    this.arguments = this.arguments.filter(x => x.type.name !== arg.type.name);
    this.onChanged();
  }

  protected addArgument(): void {
    const exclusion = new Set(this.arguments.map(x => x.type.name));

    const modal = this.modal.create<PropertyDefinitionSelectComponent, PropertyDefinitionSelector, Set<PropertyDefinition>>({
      nzTitle: this.i18n.translate.instant('选择属性作为参数'),
      nzWidth: 1000,
      nzContent: PropertyDefinitionSelectComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: new PropertyDefinitionSelector(this.properties, exclusion),
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
        this.addArguments(result);
      }
    });
  }

  private addArguments(result: Set<PropertyDefinition>) {
    for (let p of result) {
      this.arguments.push(new ArgumentDefinition(p.type));
    }

    this.arguments = this.arguments.sort((a, b) => a.type.name.localeCompare(b.type.name));

    this.onChanged();
  }
}
