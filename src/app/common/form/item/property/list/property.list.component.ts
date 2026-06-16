import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewContainerRef
} from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {Subject, takeUntil} from 'rxjs';
import {NzListModule} from 'ng-zorro-antd/list';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ValueItem} from './ValueItem';
import {DescriptionComponent} from '../../common/description/description.component';

// 严格定义每一行的 FormGroup 类型
export type PropertyItemFormGroup = FormGroup<{
  value: FormControl<number>;
  desc: FormControl<Map<string, string>>;
}>;

@Component({
  selector: 'property-list',
  templateUrl: './property.list.component.html',
  styleUrls: ['./property.list.component.less'],
  standalone: true,
  imports: [
    NzButtonModule,
    NzInputModule,
    NzToolTipModule,
    NzIconModule,
    NzTagModule,
    NzListModule,
    ReactiveFormsModule,
    NzSpaceModule,
    NzInputNumberModule,
    NzRowDirective,
    NzColDirective,
    DescriptionComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting:
      PropertyListComponent,
      multi: true
    },
    NzModalService
  ],
})
export class PropertyListComponent implements ControlValueAccessor, OnInit, OnDestroy {

  @Input() updatable = false;
  @Output() changed = new EventEmitter<void>();

  isDisabled = false;
  private destroy$ = new Subject<void>();

  formArray: FormArray<PropertyItemFormGroup>;
  viewItems: PropertyItemFormGroup[] = [];

  onChange: (val: ValueItem[]) => void = () => {
  };
  onTouched: () => void = () => {
  };

  constructor(
    private fb: FormBuilder,
    private modal: NzModalService,
    private viewRef: ViewContainerRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.formArray = new FormArray<PropertyItemFormGroup>([]);
  }

  ngOnInit(): void {
    this.formArray.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.emitToParent();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addItem(value = 0): void {
    if (this.isDisabled) return;

    const fg = new FormGroup({
      value: new FormControl(value, {nonNullable: true}),
      desc: new FormControl(new Map([['en-US', '']]), {nonNullable: true}),
    }) as PropertyItemFormGroup;

    this.formArray.push(fg);
    this.onTouched();

    this.refreshViewItems();
  }

  removeItem(idx: number): void {
    if (this.isDisabled) return;
    this.formArray.removeAt(idx);
    this.onTouched();
    this.refreshViewItems();
  }

  clearAll(): void {
    if (this.isDisabled) return;
    this.formArray.clear();
    this.onTouched();
    this.refreshViewItems();
  }

  private emitToParent(): void {
    const val = this.formArray.value as ValueItem[];
    this.onChange(val);
    this.changed.emit();
  }

  writeValue(val: ValueItem[] | null | undefined): void {
    this.formArray.clear();

    if (!Array.isArray(val)) return;

    val.forEach(item => {
      const fg = new FormGroup({
        value: new FormControl(item.value ?? 0, {nonNullable: true}),
        desc: new FormControl(item.desc ?? new Map([['en-US', '']]), {nonNullable: true}),
      }) as PropertyItemFormGroup;

      this.formArray.push(fg);
    });

    if (this.formArray.length === 0 && this.updatable) {
      this.addItem(0);
    }

    this.refreshViewItems();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(dis: boolean): void {
    this.isDisabled = dis;
    dis ? this.formArray.disable() : this.formArray.enable();
  }

  refreshViewItems() {
    // 1. 生成全新数组引用（不可变更新）
    this.viewItems = [...this.formArray.controls];
    // 2. 强制触发当前组件变更检测（立即生效）
    this.cdr.detectChanges();
  }

  protected readonly Array = Array;
}
