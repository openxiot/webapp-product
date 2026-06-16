import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'uuid',
  templateUrl: './uuid.component.html',
  standalone: true,
  imports: [
    NzInputModule,
    FormsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UuidComponent,
      multi: true
    }
  ]
})
export class UuidComponent implements ControlValueAccessor {

  @Output() changed = new EventEmitter<void>();

  // 内部真实值：number
  private innerValue = 0;

  // 界面编辑用：原始输入字符串，不自动补0
  inputHex = '';

  isDisabled = false;

  onChange: (val: number) => void = () => {};
  onTouched = () => {};

  // ==========================
  // 格式化：最终展示为 8 位十六进制
  // ==========================
  private toPaddedHex(num: number): string {
    return Math.floor(num)
      .toString(16)
      .padStart(8, '0')
      .slice(-8)
      .toUpperCase();
  }

  // ==========================
  // 外部表单写入值（number）
  // ==========================
  writeValue(obj: any): void {
    const num = Math.floor(Number(obj) || 0);
    if (num === this.innerValue) return;

    this.innerValue = num;
    this.inputHex = this.toPaddedHex(num);
  }

  // ==========================
  // 界面输入变化（实时编辑，不补0）
  // ==========================
  onInputChange(raw: string): void {
    // 只保留 0-9 A-F a-f
    const clean = raw.replace(/[^0-9a-fA-F]/g, '');
    this.inputHex = clean;

    // 转 number，但不格式化
    const num = parseInt(clean || '0', 16);
    this.innerValue = num;

    this.onChange(num);
    this.changed.emit();
  }

  // ==========================
  // 失焦时统一格式化为 8 位
  // ==========================
  onBlur(): void {
    this.onTouched();
    // 失焦后格式化为标准 8 位
    this.inputHex = this.toPaddedHex(this.innerValue);
  }

  // ==========================
  // 表单接口
  // ==========================
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // 展示用：始终 8 位
  get displayHex(): string {
    return this.toPaddedHex(this.innerValue);
  }
}
