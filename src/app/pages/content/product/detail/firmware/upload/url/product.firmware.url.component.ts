import {Component, Injector, Input, OnDestroy} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl, ValidationErrors,
  Validator
} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzUploadChangeParam, NzUploadFile, NzUploadModule, NzUploadXHRArgs} from 'ng-zorro-antd/upload';
import {MainService} from '../../../../../../../service/main.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, of, Subscription, switchMap, tap} from 'rxjs';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {FirmwareUrl} from './FirmwareUrl';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'product-firmware-url',
  standalone: true,
  templateUrl: './product.firmware.url.component.html',
  styleUrls: ['./product.firmware.url.component.less'],
  imports: [
    FormsModule,
    NzIconModule,
    NzUploadModule,
    NzColDirective,
    NzRowDirective,
    TranslatePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ProductFirmwareUrlComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS, // 注册为表单验证器
      useExisting: ProductFirmwareUrlComponent,
      multi: true
    }
  ]
})
export class ProductFirmwareUrlComponent implements ControlValueAccessor, Validator, OnDestroy {

  private _value: FirmwareUrl = new FirmwareUrl();
  error?: string;

  disabled = false;

  onChange: (value: FirmwareUrl) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    private injector: Injector,
    private http: HttpClient,
    private service: MainService,
    private msg: NzMessageService
  ) {
    // 延迟设置valueAccessor（在构造函数执行完毕后）
    setTimeout(() => {
      const ngControl = this.injector.get(NgControl);
      if (ngControl) {
        ngControl.valueAccessor = this;
      }
    });
  }

  // 添加一个getter方法获取NgControl（需要时再获取，避免立即依赖）
  private get ngControl(): NgControl | null {
    try {
      return this.injector.get(NgControl);
    } catch {
      return null;
    }
  }

  get value(): FirmwareUrl {
    return this._value;
  }

  set value(val: FirmwareUrl) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
    }

    this.onTouched();
  }

  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this._value) {
      this._value = obj;
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

  // 实现Validator接口的验证方法
  validate(control: AbstractControl): ValidationErrors | null {

    // 示例：验证必填（可根据需求添加其他验证，如文件格式、大小等）
    // if (!control.value) {
    //   this.error = '请上传固件文件，固件大小不能超过1024M'; // 内部错误信息
    //   return { firmwareUrlRequired: true }; // 返回错误对象（键名自定义）
    // }

    // // 示例：验证文件格式（假设只允许.bin文件）
    // if (control.value && !control.value.endsWith('.bin')) {
    //   this.error = '请上传.bin格式的固件文件';
    //   return { invalidFirmwareType: true };
    // }

    // 验证通过
    this.error = '';
    return null;
  }

  // 当控件内部状态变化时（如文件上传失败/删除），手动触发验证
  triggerValidation() {
    this.ngControl?.control?.updateValueAndValidity();
  }

  @Input() productId: number = 0;

  loading = false;
  uploaded: boolean = false;
  private uploadSubscription?: Subscription;

  ngOnDestroy() {
    this.uploadSubscription?.unsubscribe();
  }

  /**
   * 自定义上传逻辑入口
   * 1. 获取上传地址
   * 2. 执行文件上传
   * 3. 处理上传结果
   */
  protected customUpload = (item: NzUploadXHRArgs): Subscription => {
    console.log('customUpload: ', item);

    // 开始上传时显示加载状态
    this.loading = true;

    // 构建完整的上传流程 observable
    const uploadFlow$ = this.service.getFileUploadUrl(this.productId, 'firmware', item.file.name).pipe(
      // 切换到上传请求
      switchMap(uploadInfo => this.uploadToServer(item, uploadInfo.upload, uploadInfo.download)),
      // 处理整体流程错误
      catchError(error => this.handleUploadError(error, item))
    );

    // 订阅并保存订阅实例
    this.uploadSubscription = uploadFlow$.subscribe({
      complete: () => {
        this.loading = false; // 上传完成（成功/失败）后关闭加载
      }
    });

    return this.uploadSubscription;
  };

  /**
   * 执行文件上传到服务器
   * @param item 上传组件参数
   * @param uploadUrl 上传地址
   * @param downloadUrl 上传成功后的访问地址
   */
  private uploadToServer(item: NzUploadXHRArgs, uploadUrl: string, downloadUrl: string) {
    // S3 预签名 URL 不需要额外请求头，保持 headers 为空
    const headers = new HttpHeaders({});

    return this.http.put(uploadUrl, item.file, {
      headers,
      reportProgress: true,
      observe: 'events',
      responseType: 'text' // 适配 S3 空响应体，避免 JSON 解析错误
    }).pipe(
      tap({
        next: (event: any) => this.handleUploadEvent(event, item, downloadUrl),
        error: (err) => this.handleUploadError(err, item) // 统一错误处理
      })
    );
  }

  /**
   * 处理上传过程中的事件（严格区分事件类型）
   */
  private handleUploadEvent(event: any, item: NzUploadXHRArgs, downloadUrl: string): void {
    console.log('handleUploadEvent: ', event);

    switch (event.type) {
      case 0: // Sent 事件：请求已发送
        console.log('文件上传请求已发送');
        break;

      case 1: // UploadProgress 事件：上传进度
        const progress = Math.round(100 * (event.loaded / (event.total || 1)));
        item.onProgress?.({ percent: progress }, item.file);
        break;

      case 4: // Response 事件：上传完成（成功收到响应）
        // 验证 S3 成功响应状态码（200 或 204）
        if (event.status === 200 || event.status === 204) {
          this.value.url = downloadUrl; // 同步表单值
          item.onSuccess?.(event.body, item.file, event); // 通知组件成功
        } else {
          // 非成功状态码（如 400/403），触发错误处理
          this.handleUploadError(new Error(`S3 响应错误: ${event.statusText}`), item);
        }
        break;
    }
  }

  /**
   * 增强错误处理（捕获 S3 具体错误信息）
   */
  private handleUploadError(error: any, item: NzUploadXHRArgs) {
    // 提取 S3 错误信息（从响应体或状态码）
    let errorMsg = '上传失败，请重试';
    if (error.status === 403) {
      errorMsg = '上传失败：签名无效或请求头不匹配（可能是 Content-Type 问题）';
    } else if (error.status === 400) {
      errorMsg = '上传失败：请求格式错误（可能是文件类型不支持）';
    } else if (error.message) {
      errorMsg = `上传失败：${error.message}`;
    }

    this.msg.error(errorMsg);
    console.error('S3 上传错误详情:', error); // 打印完整错误便于调试
    item.onError?.(error, item.file);
    return of(null);
  }

  protected beforeUpload = (file: NzUploadFile): boolean => {
    console.log('beforeUpload: ', file);

    this._value.fileName = file.name;
    this._value.fileSize = file.size || 0;

    const sizeValid = (file.size! / 1024 / 1024) < 1024;
    if (!sizeValid) {
      // this.msg.warning('固件必须小于1024M');

      // 文件上传失败时触发错误
      this.value = new FirmwareUrl()
      this.triggerValidation(); // 触发验证，显示错误
    }

    return sizeValid;
  };

  protected handleChange(change: NzUploadChangeParam) {
    console.log('handleChange: ', change);
    switch (change.type) {
      case 'start':
        this.loading = true;
        break;

      case 'success':
        this.uploaded = true;
        this.loading = false;
        break;

      case 'error':
        this.loading = false;

        // 文件上传失败时触发错误
        this.value = new FirmwareUrl()
        this.triggerValidation(); // 触发验证，显示错误
        // this.msg.error('上传失败，请重试');
        break;
    }
  }

  // 新增删除方法
  protected handleDelete(event: MouseEvent): void {
    console.log('handleDelete: ', event);

    event.stopPropagation(); // 阻止事件冒泡到上传组件

    // 1. 清除当前图片
    this.value = new FirmwareUrl()
    this.uploaded = false;

    // 2. 可选：调用后端接口删除服务器上的文件
    // this.service.deleteFile(this.productId, this.iconUrl).subscribe();
  }
}
