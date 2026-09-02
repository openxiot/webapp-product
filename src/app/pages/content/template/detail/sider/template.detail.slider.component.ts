import {Component, computed, EventEmitter, input, Output, signal} from '@angular/core';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzListModule} from 'ng-zorro-antd/list';
import {DeviceTemplate, ServiceTemplate} from '@openxiot/xiot-core-spec-ts';
import {TemplateServicesComponent} from './services/template.services.component';
import {TemplateServiceComponent} from './service/template.service.component';
import {NzCardModule} from 'ng-zorro-antd/card';
import {TemplateOp} from '../../../../../typedef/template/TemplateEditor';

@Component({
  selector: 'template-detail-slider',
  templateUrl: './template.detail.slider.component.html',
  styleUrl: './template.detail.slider.component.less',
  standalone: true,
  imports: [
    NzMenuModule,
    NzLayoutModule,
    NzListModule,
    NzCardModule,
    TemplateServicesComponent,
    TemplateServiceComponent,
  ],
})
export class TemplateDetailSliderComponent {

  version = input(false);
  editable = input(false);
  template = input.required<DeviceTemplate>();
  @Output() op = new EventEmitter<TemplateOp>();

  /** 当前选中的服务 iid；当服务 iid 被改时跟随（见 onOp 特判）。 */
  serviceIid = signal<number | undefined>(undefined);

  /** 从当前 template 中按选中的 serviceIid 重解析出服务；同 iid 自提交只会换新引用、不丢面板。 */
  service = computed(() => {
    const iid = this.serviceIid();
    if (iid === undefined) return undefined;
    return this.template()?.services.get(iid);
  });

  onServiceSelected(s: ServiceTemplate) {
    this.serviceIid.set(s.iid);
  }

  protected onOp(op: TemplateOp) {
    // 选中服务自身改 iid：先把选中 key 跟随到新 iid 再转发，否则 reducer 重排顶层 Map 后
    // service() 会因旧 key 消失而变 undefined（面板消失）。
    // 注意：Zoneless 下 emit 后顶层 template 只会在此轮变更检测末更新到本组件 input，
    // 因此不能用「改完再查 template」判断冲突（必然读到旧值）。改为在转发前同步判断：
    // 目标 iid 已存在 → reducer（updateService 冲突守卫）会 no-op、旧 key 仍在，不跟随；
    // 目标 iid 不存在 → 改名必然提交，乐观跟随到新 iid 是安全的。
    if (op.kind === 'updateService'
      && op.serviceIid === this.serviceIid()
      && typeof op.patch.iid === 'number') {
      if (!this.template()?.services.has(op.patch.iid)) {
        this.serviceIid.set(op.patch.iid);
      }
      this.op.emit(op);
      return;
    }
    this.op.emit(op);
  }
}
