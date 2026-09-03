import {Component, computed, EventEmitter, input, Output, signal} from '@angular/core';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzListModule} from 'ng-zorro-antd/list';
import {DeviceInstance, Service} from '@openxiot/xiot-core-spec-ts';
import {InstanceServicesComponent} from './services/instance.services.component';
import {InstanceServiceComponent} from './service/instance.service.component';
import {NzCardModule} from 'ng-zorro-antd/card';
import {InstanceOp} from '../../../../../../typedef/instance/InstanceEditor';

@Component({
  selector: 'product-instance-detail',
  templateUrl: './product.instance.detail.component.html',
  styleUrl: './product.instance.detail.component.less',
  standalone: true,
  imports: [
    NzMenuModule,
    NzLayoutModule,
    NzListModule,
    NzCardModule,
    InstanceServicesComponent,
    InstanceServiceComponent,
  ],
  providers: [],
})
export class ProductInstanceDetailComponent {

  version = input(false);
  editable = input(false);
  instance = input.required<DeviceInstance>();
  @Output() op = new EventEmitter<InstanceOp>();

  /** 当前选中的服务 iid；当服务 iid 被改时跟随（见 onOp 特判）。 */
  serviceIid = signal<number | undefined>(undefined);

  /** 从当前 instance 中按选中的 serviceIid 重解析出服务；同 iid 自提交只会换新引用、不丢面板。 */
  services = computed(() => this.instance().getServices());

  service = computed(() => {
    const iid = this.serviceIid();
    if (iid === undefined) return undefined;
    return this.instance().services.get(iid);
  });

  onServiceSelected(s: Service) {
    this.serviceIid.set(s.iid);
  }

  protected onOp(op: InstanceOp) {
    // 选中服务自身改 iid：先把选中 key 跟随到新 iid 再转发，否则 reducer 重排顶层 Map 后
    // service() 会因旧 key 消失而变 undefined（面板消失）。同 slider 注释：改名目标已存在则
    // reducer 冲突守卫 no-op、旧 key 仍在，不跟随。
    if (op.kind === 'updateService'
      && op.serviceIid === this.serviceIid()
      && typeof op.patch.iid === 'number') {
      if (!this.instance().services.has(op.patch.iid)) {
        this.serviceIid.set(op.patch.iid);
      }
      this.op.emit(op);
      return;
    }
    this.op.emit(op);
  }
}
