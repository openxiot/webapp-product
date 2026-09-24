import {Component, Injector, OnDestroy, signal} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
  Validator
} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzUploadChangeParam, NzUploadFile, NzUploadModule, NzUploadXHRArgs} from 'ng-zorro-antd/upload';
import {MainService} from '../../../../../../service/main.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, of, Subscription, switchMap, tap} from 'rxjs';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {ControllerWeb} from './ControllerWeb';
import {TranslatePipe} from '@ngx-translate/core';
import {AccountService} from '../../../../../../service/account.service';

@Component({
  selector: 'product-controller-upload',
  standalone: true,
  templateUrl: './product.controller.upload.component.html',
  styleUrl: './product.controller.upload.component.less',
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
      useExisting: ProductControllerUploadComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: ProductControllerUploadComponent,
      multi: true
    }
  ]
})
export class ProductControllerUploadComponent implements ControlValueAccessor, Validator, OnDestroy {

  private _value = signal<ControllerWeb>(new ControllerWeb());
  error?: string;

  disabled = signal(false);

  onChange: (value: ControllerWeb) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    private injector: Injector,
    private http: HttpClient,
    private service: MainService,
    private account: AccountService,
    private msg: NzMessageService
  ) {
    setTimeout(() => {
      const ngControl = this.injector.get(NgControl);
      if (ngControl) {
        ngControl.valueAccessor = this;
      }
    });
  }

  private get ngControl(): NgControl | null {
    try {
      return this.injector.get(NgControl);
    } catch {
      return null;
    }
  }

  get value(): ControllerWeb {
    return this._value();
  }

  set value(val: ControllerWeb) {
    if (val !== this._value()) {
      this._value.set(val);
      this.onChange(val);
    }

    this.onTouched();
  }

  writeValue(obj: any): void {
    if (obj !== undefined && obj !== null && obj !== this._value()) {
      this._value.set(obj);
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled.set(isDisabled);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value && !control.value.url) {
      this.error = '请上传控制页文件（html 或 zip）';
      return {controllerWebRequired: true};
    }

    this.error = '';
    return null;
  }

  triggerValidation() {
    this.ngControl?.control?.updateValueAndValidity();
  }

  loading = signal(false);
  uploaded: boolean = false;
  private uploadSubscription?: Subscription;

  ngOnDestroy() {
    this.uploadSubscription?.unsubscribe();
  }

  protected customUpload = (item: NzUploadXHRArgs): Subscription => {
    this.loading.set(true);

    const uploadFlow$ = this.service.getFileUploadUrl(this.account.organization().id, "product", "controller", item.file.name).pipe(
      switchMap(uploadInfo => this.uploadToServer(item, uploadInfo.upload, uploadInfo.download)),
      catchError(error => this.handleUploadError(error, item))
    );

    this.uploadSubscription = uploadFlow$.subscribe({
      complete: () => {
        this.loading.set(false);
      }
    });

    return this.uploadSubscription;
  };

  private uploadToServer(item: NzUploadXHRArgs, uploadUrl: string, downloadUrl: string) {
    const headers = new HttpHeaders({
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': item.file.type || 'application/octet-stream'
    });

    return this.http.put(uploadUrl, item.file, {
      headers,
      reportProgress: true,
      observe: 'events',
      responseType: 'text'
    }).pipe(
      tap({
        next: (event: any) => this.handleUploadEvent(event, item, downloadUrl),
        error: (err) => this.handleUploadError(err, item)
      })
    );
  }

  private handleUploadEvent(event: any, item: NzUploadXHRArgs, downloadUrl: string): void {
    switch (event.type) {
      case 1:
        const progress = Math.round(100 * (event.loaded / (event.total || 1)));
        item.onProgress?.({percent: progress}, item.file);
        break;

      case 4:
        // Azure Blob PUT 成功返回 201 Created（也可能 200/204）
        if (event.status === 200 || event.status === 201 || event.status === 204) {
          this.value.url = downloadUrl;
          item.onSuccess?.(event.body, item.file, event);
        } else {
          this.handleUploadError(new Error(`S3 响应错误: ${event.statusText}`), item);
        }
        break;
    }
  }

  private handleUploadError(error: any, item: NzUploadXHRArgs) {
    let errorMsg = '上传失败，请重试';
    if (error.status === 403) {
      errorMsg = '上传失败：签名无效或请求头不匹配（可能是 Content-Type 问题）';
    } else if (error.status === 400) {
      errorMsg = '上传失败：请求格式错误（可能是文件类型不支持）';
    } else if (error.message) {
      errorMsg = `上传失败：${error.message}`;
    }

    this.msg.error(errorMsg);
    item.onError?.(error, item.file);
    return of(null);
  }

  protected beforeUpload = (file: NzUploadFile): boolean => {
    const name = (file.name || '').toLowerCase();
    const extOk = name.endsWith('.html') || name.endsWith('.htm') || name.endsWith('.zip');
    if (!extOk) {
      this.msg.warning('仅支持上传 html 或 zip 格式的控制页文件');
      this.value = new ControllerWeb();
      this.triggerValidation();
      return false;
    }

    this._value().fileName = file.name;
    this._value().fileSize = file.size || 0;
    this._value().format = name.endsWith('.zip') ? 'zip' : 'html';

    const sizeValid = (file.size! / 1024 / 1024) < 1024;
    if (!sizeValid) {
      this.value = new ControllerWeb();
      this.triggerValidation();
    }

    return sizeValid;
  };

  protected handleChange(change: NzUploadChangeParam) {
    switch (change.type) {
      case 'start':
        this.loading.set(true);
        break;

      case 'success':
        this.uploaded = true;
        this.loading.set(false);
        break;

      case 'error':
        this.loading.set(false);
        this.value = new ControllerWeb();
        this.triggerValidation();
        break;
    }
  }

  protected handleDelete(event: MouseEvent): void {
    event.stopPropagation();

    this.value = new ControllerWeb();
    this.uploaded = false;
  }
}