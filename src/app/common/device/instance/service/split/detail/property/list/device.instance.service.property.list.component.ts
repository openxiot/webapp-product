import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
  ControlValueAccessor,
  FormArray, FormBuilder, FormControl,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {LifeCycle} from "@openxiot/xiot-core-spec-ts";
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {ValueItem} from './ValueItem';
import {NzInputNumberComponent, NzInputNumberGroupComponent} from 'ng-zorro-antd/input-number';
import {Subject, takeUntil} from 'rxjs';
import {NzListModule} from 'ng-zorro-antd/list';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

@Component({
  selector: 'device-instance-service-property-list',
  templateUrl: './device.instance.service.property.list.component.html',
  styleUrls: ['./device.instance.service.property.list.component.less'],
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    NzToolTipModule,
    NzIconModule,
    NzTagModule,
    NzListModule,
    FormsModule,
    ReactiveFormsModule,
    NzCheckboxModule,
    NzSpaceModule,
    NzTagModule,
    NzInputNumberComponent,
    NzInputNumberGroupComponent,
    NzRowDirective,
    NzColDirective,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DeviceInstanceServicePropertyListComponent,
      multi: true
    }
  ],
})
export class DeviceInstanceServicePropertyListComponent implements ControlValueAccessor, OnInit, OnDestroy {

  protected readonly LifeCycle = LifeCycle;

  @Input() lifecycle: LifeCycle = LifeCycle.DEVELOPMENT;
  @Output() changed: EventEmitter<void> = new EventEmitter<void>();

  // 组件内部维护的值
  listFormArray: FormArray<FormGroup<{
    value: FormControl<number>;
    descriptionZH: FormControl<string>;
    descriptionEN: FormControl<string>;
  }>>;

  // 禁用状态
  isDisabled = false;

  // 定义变化回调和触摸回调
  onChange: (value: ValueItem[]) => void = () => {};
  onTouched: () => void = () => {};

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
  ) {
    this.listFormArray = this.fb.array<
      FormGroup<{
        value: FormControl<number>;
        descriptionZH: FormControl<string>;
        descriptionEN: FormControl<string>;
      }>
    >([]);
  }

  ngOnInit(): void {
    // 监听每个表单项的变化
    this.listFormArray.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // 当内部表单变化时，通知父组件
        this.emitValueToParent();
      });

    // 监听整个 FormArray 的添加/删除操作
    this.listFormArray.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onTouched();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 获取当前所有值（从 FormArray 转换）
  private getCurrentValue(): ValueItem[] {
    return this.listFormArray.controls.map(control => ({
      value: control.value.value || 0,
      descriptionZH: control.value.descriptionZH || '',
      descriptionEN: control.value.descriptionEN || ''
    }));
  }

  // 发送值给父组件
  private emitValueToParent(): void {
    const value = this.getCurrentValue();
    this.onChange(value);
    this.changed.emit();
  }

  // 获取 FormArray 的 controls（用于模板）
  get items(): FormGroup<{
    value: FormControl<number>;
    descriptionZH: FormControl<string>;
    descriptionEN: FormControl<string>;
  }>[] {
    return this.listFormArray.controls as FormGroup<{
      value: FormControl<number>;
      descriptionZH: FormControl<string>;
      descriptionEN: FormControl<string>;
    }>[];
  }

  // 添加新项
  addItem(value: number = 0, descriptionZH: string = '', descriptionEN: string = '', notify: boolean = true): void {
    if (this.isDisabled) {
      return;
    }

    const item: FormGroup<{
      value: FormControl<number>;
      descriptionZH: FormControl<string>;
      descriptionEN: FormControl<string>;
    }> = this.fb.nonNullable.group({
      value: value,
      descriptionZH: descriptionZH,
      descriptionEN: descriptionEN,
    });

    this.listFormArray.push(item);

    if (notify) {
      this.onTouched();
    }
  }

  // 移除项
  removeItem(index: number): void {
    if (this.isDisabled) return;

    this.listFormArray.removeAt(index);
    this.onTouched();
  }

  // 清空所有项
  clearAll(): void {
    if (this.isDisabled) return;

    this.listFormArray.clear();
    this.onTouched();
  }

  // 检查是否为空
  get isEmpty(): boolean {
    return this.listFormArray.length === 0;
  }

  // // 获取项数
  // get count(): number {
  //   return this.listFormArray.length;
  // }

  // --- ControlValueAccessor 接口方法 ---

  writeValue(value: ValueItem[] | null | undefined): void {
    console.log('ListComponent writeValue:', value);

    // 清空现有项
    this.listFormArray.clear();

    if (Array.isArray(value)) {
      // 添加新项
      value.forEach(item => {
        this.addItem(item.value, item.descriptionZH, item.descriptionEN, false);
      });
    } else if (value) {
      // 如果不是数组，尝试转换为数组
      console.warn('ListComponent: Expected array but got', typeof value);
    }

    // 如果没有项，添加一个默认项（可选）
    if (this.listFormArray.length === 0 && this.lifecycle === LifeCycle.DEVELOPMENT) {
      this.addItem(0, '');
    }
  }

  registerOnChange(fn: (value: ValueItem[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;

    if (isDisabled) {
      this.listFormArray.disable();
    } else {
      this.listFormArray.enable();
    }
  }
}
