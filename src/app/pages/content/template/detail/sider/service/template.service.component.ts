import {Component, computed, effect, EventEmitter, input, Output, signal} from '@angular/core';
import {
  ActionTemplate,
  EventTemplate,
  PropertyTemplate,
  ServiceTemplate
} from '@openxiot/xiot-core-spec-ts';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzTagModule} from 'ng-zorro-antd/tag';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzContentComponent, NzLayoutComponent, NzSiderComponent} from 'ng-zorro-antd/layout';
import {TemplateServiceCardComponent} from './card/template.service.card.component';
import {TemplatePropertyDetailComponent} from './detail/property/template.property.detail.component';
import {TemplateServiceDetailComponent} from './detail/service/template.service.detail.component';
import {TemplateActionDetailComponent} from './detail/action/template.action.detail.component';
import {TemplateEventDetailComponent} from './detail/event/template.event.detail.component';
import {TemplateOp} from '../../../../../../typedef/template/TemplateEditor';

/** 容器内面板选择：只按 iid 记忆，展示对象由 computed 从当前 service 重解析。 */
type ServicePanelSelection =
  | { kind: 'service' }
  | { kind: 'property'; piid: number }
  | { kind: 'action'; actionIid: number }
  | { kind: 'event'; eventIid: number };

@Component({
  selector: 'template-service',
  templateUrl: './template.service.component.html',
  styleUrl: './template.service.component.less',
  standalone: true,
  imports: [
    NzTabsModule,
    NzCardModule,
    NzDescriptionsModule,
    NzSpaceModule,
    NzTagModule,
    NzTableModule,
    NzContentComponent,
    NzLayoutComponent,
    NzSiderComponent,
    TemplateServiceCardComponent,
    TemplatePropertyDetailComponent,
    TemplateServiceDetailComponent,
    TemplateActionDetailComponent,
    TemplateEventDetailComponent,
  ],
  providers: [
    NzModalService
  ],
})
export class TemplateServiceComponent {

  showVersion = input(false);
  editable = input(false);
  service = input.required<ServiceTemplate>();
  @Output() op = new EventEmitter<TemplateOp>();

  /** 原子面板选择：kind=service 显示功能详情，其余按 iid 显示对应编辑页。 */
  selection = signal<ServicePanelSelection>({kind: 'service'});

  property = computed(() => {
    const sel = this.selection();
    if (sel.kind !== 'property') return undefined;
    return this.service()?.properties.get(sel.piid);
  });

  action = computed(() => {
    const sel = this.selection();
    if (sel.kind !== 'action') return undefined;
    return this.service()?.actions.get(sel.actionIid);
  });

  event = computed(() => {
    const sel = this.selection();
    if (sel.kind !== 'event') return undefined;
    return this.service()?.events.get(sel.eventIid);
  });

  /** 上一个 service 的 iid：仅当真正切换到别的服务（或当前服务被改 iid）时才重置面板。 */
  private prevServiceIid: number | undefined = undefined;

  constructor() {
    effect(() => {
      const svc = this.service();
      const sel = this.selection();
      if (!svc) return;

      // 服务切换 / 服务自身 iid 被改 → 重置回 service 面板。
      if (this.prevServiceIid !== svc.iid) {
        this.prevServiceIid = svc.iid;
        if (sel.kind !== 'service') {
          this.selection.set({kind: 'service'});
        }
        return;
      }

      // 同 iid 自提交（兄弟变更）不重置；只有当前选中项已被删除时回退到 service 面板。
      const valid = sel.kind === 'service' ? true
        : sel.kind === 'property' ? svc.properties.has(sel.piid)
          : sel.kind === 'action' ? svc.actions.has(sel.actionIid)
            : svc.events.has(sel.eventIid);
      if (!valid) {
        this.selection.set({kind: 'service'});
      }
    });
  }

  onTitleSelected() {
    this.selection.set({kind: 'service'});
  }

  onPropertySelected(property: PropertyTemplate) {
    this.selection.set({kind: 'property', piid: property.iid});
  }

  onActionSelected(action: ActionTemplate) {
    this.selection.set({kind: 'action', actionIid: action.iid});
  }

  onEventSelected(event: EventTemplate) {
    this.selection.set({kind: 'event', eventIid: event.iid});
  }

  /** 叶子（service/property/action/event detail）冒泡的 op 原样上抛，由顶层 reducer 统一落库。 */
  protected onOp(op: TemplateOp) {
    this.op.emit(op);
  }
}
