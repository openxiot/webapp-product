import {
  Access,
  ActionDefinition,
  ActionTemplate,
  Argument,
  ConstraintValue,
  DataFormat,
  DeviceTemplate,
  EventDefinition,
  EventTemplate,
  LifeCycle,
  PropertyDefinition,
  PropertyTemplate,
  ServiceDefinition,
  ServiceTemplate,
} from '@openxiot/xiot-core-spec-ts';
import {DeviceTemplateHelper} from './DeviceTemplateHelper';
import {ServiceTemplateHelper} from './ServiceTemplateHelper';

/**
 * 模板详情编辑树的「不可变操作」层。
 *
 * 领域对象（DeviceTemplate/ServiceTemplate/PropertyTemplate/...）是可变的普通类，
 * 但这里提供一组纯函数：所有模型改动都收敛成 TemplateOp，reducer 用「沿变更路径
 * 重建新引用（结构共享）」的方式产出新的 DeviceTemplate——被改的那条分支换新对象，
 * 未动的兄弟保持原引用。这样 Zoneless 下每个读方因「自己的 signal input / computed
 * 值变化」而被标记脏并重绘，不再依赖 Default 级联或手动 detectChanges()。
 *
 * 约定：
 *  - 除本文件外的任何代码不再对共享模型做原地修改。
 *  - 目标 iid 缺失（或 iid 变更与同容器已有值冲突）时返回【同一个】device（no-op），
 *    避免让无关读方看到一个多余的身份变化。
 *  - description Map：未在 patch 中提供时保持【共享同一引用】，绝不复制。
 */

/* ------------------------------------------------------------------ *
 * Patch 类型（字段全部可选：缺省 = 保持原值；对象内的 null 用 'in' 判断，见 clone）
 * ------------------------------------------------------------------ */

export interface ServicePatch {
  required?: boolean;
  /** 变更服务 iid：克隆后由顶层 DeviceTemplate 构造器按新 iid 重建 Map（自动重排 key）。 */
  iid?: number;
  description?: Map<string, string>;
  propertyAddable?: boolean;
  actionAddable?: boolean;
  eventAddable?: boolean;
}

export interface PropertyPatch {
  required?: boolean;
  /** 变更属性 iid：见 updateProperty 的冲突守卫与同服务内参数/members 引用改写。 */
  iid?: number;
  description?: Map<string, string>;
  access?: Access;
  format?: DataFormat;
  /** null = 无取值约束(ConstraintType.NONE)；提供 null 时必须显式带上此字段。 */
  constraintValue?: ConstraintValue | null;
  unit?: string | null;
  members?: number[];
}

export interface ActionPatch {
  required?: boolean;
  iid?: number;
  description?: Map<string, string>;
  /** 整体替换输入参数 Map（编辑端已经基于克隆的 Argument 重建好）。 */
  in?: Map<number, Argument>;
  out?: Map<number, Argument>;
}

export interface EventPatch {
  required?: boolean;
  iid?: number;
  description?: Map<string, string>;
  arguments?: Map<number, Argument>;
}

/* ------------------------------------------------------------------ *
 * TemplateOp：唯一允许的「改动词汇表」
 * ------------------------------------------------------------------ */

export type TemplateOp =
  | { kind: 'setDeviceDescription'; lang: string; value: string }
  | { kind: 'setDeviceLifecycle'; lifecycle: LifeCycle }

  | { kind: 'addService'; defs: ServiceDefinition[]; version: number;
      properties: Map<string, PropertyDefinition>;
      actions: Map<string, ActionDefinition>;
      events: Map<string, EventDefinition> }
  | { kind: 'removeService'; serviceIid: number }
  | { kind: 'updateService'; serviceIid: number; patch: ServicePatch }

  | { kind: 'addProperties'; serviceIid: number; defs: PropertyDefinition[]; version: number }
  | { kind: 'addActions'; serviceIid: number; defs: ActionDefinition[];
      properties: Map<string, PropertyDefinition>; version: number }
  | { kind: 'addEvents'; serviceIid: number; defs: EventDefinition[];
      properties: Map<string, PropertyDefinition>; version: number }

  | { kind: 'removeProperty'; serviceIid: number; piid: number }
  | { kind: 'removeAction'; serviceIid: number; actionIid: number }
  | { kind: 'removeEvent'; serviceIid: number; eventIid: number }

  | { kind: 'updateProperty'; serviceIid: number; piid: number; patch: PropertyPatch }
  | { kind: 'updateAction'; serviceIid: number; actionIid: number; patch: ActionPatch }
  | { kind: 'updateEvent'; serviceIid: number; eventIid: number; patch: EventPatch };

/* ------------------------------------------------------------------ *
 * 基础 clone 助手（结构共享的唯一实现点）
 * ------------------------------------------------------------------ */

function cloneDevice(device: DeviceTemplate, services: ServiceTemplate[]): DeviceTemplate {
  const d = new DeviceTemplate(device.type, device.description, services);
  d.lifecycle = device.lifecycle;
  return d;
}

interface ServiceOverrides {
  iid?: number;
  required?: boolean;
  description?: Map<string, string>;
  properties?: Map<number, PropertyTemplate>;
  actions?: Map<number, ActionTemplate>;
  events?: Map<number, EventTemplate>;
  propertyAddable?: boolean;
  actionAddable?: boolean;
  eventAddable?: boolean;
}

function cloneService(service: ServiceTemplate, over: ServiceOverrides = {}): ServiceTemplate {
  return new ServiceTemplate(
    over.iid ?? service.iid,
    over.required ?? service.required,
    service.type,
    over.description ?? service.description,
    Array.from((over.properties ?? service.properties).values()),
    Array.from((over.actions ?? service.actions).values()),
    Array.from((over.events ?? service.events).values()),
    over.propertyAddable ?? service.propertyAddable,
    over.actionAddable ?? service.actionAddable,
    over.eventAddable ?? service.eventAddable,
    service.source,
  );
}

interface PropertyOverrides {
  iid?: number;
  required?: boolean;
  description?: Map<string, string>;
  access?: Access;
  format?: DataFormat;
  constraintValue?: ConstraintValue | null;
  unit?: string | null;
  members?: number[];
}

function cloneProperty(p: PropertyTemplate, over: PropertyOverrides = {}): PropertyTemplate {
  return new PropertyTemplate(
    over.iid ?? p.iid,
    p.type,
    over.description ?? p.description,
    over.format ?? p.format,
    over.access ?? p.access,
    'constraintValue' in over ? over.constraintValue : p.constraintValue,
    'unit' in over ? over.unit : p.unit,
    over.members ?? p.members,
    over.required ?? p.required,
    p.source,
  );
}

function cloneArgument(piid: number, a: Argument): Argument {
  return Argument.of(piid, a.minRepeat, a.maxRepeat);
}

interface ActionOverrides {
  iid?: number;
  required?: boolean;
  description?: Map<string, string>;
  in?: Map<number, Argument>;
  out?: Map<number, Argument>;
}

function cloneAction(a: ActionTemplate, over: ActionOverrides = {}): ActionTemplate {
  return new ActionTemplate(
    over.iid ?? a.iid,
    over.required ?? a.required,
    a.type,
    over.description ?? a.description,
    Array.from((over.in ?? a.in).values()),
    Array.from((over.out ?? a.out).values()),
    a.source,
  );
}

interface EventOverrides {
  iid?: number;
  required?: boolean;
  description?: Map<string, string>;
  arguments?: Map<number, Argument>;
}

function cloneEvent(e: EventTemplate, over: EventOverrides = {}): EventTemplate {
  return new EventTemplate(
    over.iid ?? e.iid,
    over.required ?? e.required,
    e.type,
    over.description ?? e.description,
    Array.from((over.arguments ?? e.arguments).values()),
    e.source,
  );
}

/** 唯一交换点：把 serviceIid 对应的服务替换为 newService，其余服务引用保持不变。 */
function replaceService(device: DeviceTemplate, serviceIid: number, newService: ServiceTemplate): DeviceTemplate {
  return cloneDevice(device, device.getServices().map(s => (s.iid === serviceIid ? newService : s)));
}

/** 复制一张 Map，把 key（及 Argument.piid 值）从 oldPiid 改写为 newPiid。 */
function rewriteArgumentMap(map: Map<number, Argument>, oldPiid: number, newPiid: number): Map<number, Argument> {
  const out = new Map<number, Argument>();
  map.forEach((arg, key) => {
    if (arg.piid === oldPiid) {
      out.set(newPiid, cloneArgument(newPiid, arg));
    } else {
      out.set(key, arg);
    }
  });
  return out;
}

/** 从参数 Map 中移除引用 removedPiid 的条目（供删除属性后清理悬空引用）。 */
function dropArgumentMapRefs(map: Map<number, Argument>, removedPiid: number): Map<number, Argument> {
  const out = new Map<number, Argument>();
  map.forEach((arg, key) => {
    if (key !== removedPiid && arg.piid !== removedPiid) {
      out.set(key, arg);
    }
  });
  return out;
}

/* ------------------------------------------------------------------ *
 * 设备级
 * ------------------------------------------------------------------ */

export function setDeviceDescription(device: DeviceTemplate, lang: string, value: string): DeviceTemplate {
  const description = new Map(device.description);
  description.set(lang, value);
  const d = cloneDevice(device, device.getServices());
  d.description = description;
  return d;
}

export function setDeviceLifecycle(device: DeviceTemplate, lifecycle: LifeCycle): DeviceTemplate {
  const d = cloneDevice(device, device.getServices());
  d.lifecycle = lifecycle;
  return d;
}

export function removeService(device: DeviceTemplate, serviceIid: number): DeviceTemplate {
  if (!device.services.has(serviceIid)) return device;
  return cloneDevice(device, device.getServices().filter(s => s.iid !== serviceIid));
}

export function updateService(device: DeviceTemplate, serviceIid: number, patch: ServicePatch): DeviceTemplate {
  const service = device.services.get(serviceIid);
  if (!service) return device;
  const newIid = patch.iid ?? serviceIid;
  // 冲突守卫：服务 iid 不能改成同容器内已存在的值，否则顶层 Map 会因重排 key 静默吞并。
  if (newIid !== serviceIid && device.services.has(newIid)) return device;
  return replaceService(device, serviceIid, cloneService(service, patch));
}

/* ------------------------------------------------------------------ *
 * 属性 / 动作 / 事件
 * ------------------------------------------------------------------ */

/**
 * 变更属性 iid 时重写「同服务内对该 piid 的引用」：
 *  - action.in / action.out、event.arguments 的 key 与 Argument.piid：old → new；
 *  - 其它（组合）属性的 members 数组：old → new。
 * 返回重写后的 properties/actions/events 三张新 Map。
 */
function rekeyPropertyReferences(
  properties: Map<number, PropertyTemplate>,
  actions: Map<number, ActionTemplate>,
  events: Map<number, EventTemplate>,
  oldPiid: number,
  newPiid: number,
): { properties: Map<number, PropertyTemplate>; actions: Map<number, ActionTemplate>; events: Map<number, EventTemplate> } {
  const newProperties = new Map<number, PropertyTemplate>();
  properties.forEach((p) => {
    if (p.members && p.members.includes(oldPiid)) {
      newProperties.set(p.iid, cloneProperty(p, {members: p.members.map(m => (m === oldPiid ? newPiid : m))}));
    } else {
      newProperties.set(p.iid, p);
    }
  });

  const newActions = new Map<number, ActionTemplate>();
  actions.forEach((a) => {
    const inChanged = a.in.has(oldPiid);
    const outChanged = a.out.has(oldPiid);
    if (inChanged || outChanged) {
      newActions.set(a.iid, cloneAction(a, {
        in: inChanged ? rewriteArgumentMap(a.in, oldPiid, newPiid) : undefined,
        out: outChanged ? rewriteArgumentMap(a.out, oldPiid, newPiid) : undefined,
      }));
    } else {
      newActions.set(a.iid, a);
    }
  });

  const newEvents = new Map<number, EventTemplate>();
  events.forEach((e) => {
    if (e.arguments.has(oldPiid)) {
      newEvents.set(e.iid, cloneEvent(e, {arguments: rewriteArgumentMap(e.arguments, oldPiid, newPiid)}));
    } else {
      newEvents.set(e.iid, e);
    }
  });

  return {properties: newProperties, actions: newActions, events: newEvents};
}

export function updateProperty(device: DeviceTemplate, serviceIid: number, piid: number, patch: PropertyPatch): DeviceTemplate {
  const service = device.services.get(serviceIid);
  const p = service?.properties.get(piid);
  if (!service || !p) return device;

  const newIid = patch.iid ?? piid;
  // 冲突守卫：不能改成同容器内已存在的值。
  if (newIid !== piid && service.properties.has(newIid)) return device;

  const newProperty = cloneProperty(p, {...patch, iid: newIid});
  const properties = new Map(service.properties);
  properties.delete(piid);
  properties.set(newIid, newProperty);

  if (newIid !== piid) {
    const rewritten = rekeyPropertyReferences(properties, service.actions, service.events, piid, newIid);
    return replaceService(device, serviceIid, cloneService(service, rewritten));
  }

  return replaceService(device, serviceIid, cloneService(service, {properties}));
}

export function updateAction(device: DeviceTemplate, serviceIid: number, actionIid: number, patch: ActionPatch): DeviceTemplate {
  const service = device.services.get(serviceIid);
  const action = service?.actions.get(actionIid);
  if (!service || !action) return device;

  const newIid = patch.iid ?? actionIid;
  if (newIid !== actionIid && service.actions.has(newIid)) return device;

  const actions = new Map(service.actions);
  actions.delete(actionIid);
  actions.set(newIid, cloneAction(action, {...patch, iid: newIid}));

  return replaceService(device, serviceIid, cloneService(service, {actions}));
}

export function updateEvent(device: DeviceTemplate, serviceIid: number, eventIid: number, patch: EventPatch): DeviceTemplate {
  const service = device.services.get(serviceIid);
  const event = service?.events.get(eventIid);
  if (!service || !event) return device;

  const newIid = patch.iid ?? eventIid;
  if (newIid !== eventIid && service.events.has(newIid)) return device;

  const events = new Map(service.events);
  events.delete(eventIid);
  events.set(newIid, cloneEvent(event, {...patch, iid: newIid}));

  return replaceService(device, serviceIid, cloneService(service, {events}));
}

/**
 * 删除属性时同时清理同服务内对它的悬空引用（参数条目与组合 members）。
 * 行为变更：旧代码原地 delete 后 action/event 参数会残留失效 piid。
 */
export function removeProperty(device: DeviceTemplate, serviceIid: number, piid: number): DeviceTemplate {
  const service = device.services.get(serviceIid);
  if (!service || !service.properties.has(piid)) return device;

  const properties = new Map(service.properties);
  properties.delete(piid);

  let actions = service.actions;
  let events = service.events;

  // 引用该属性的 action/event → 克隆并去掉对应参数条目。
  const referencedByAction = Array.from(actions.values()).some(a => a.in.has(piid) || a.out.has(piid));
  if (referencedByAction) {
    const newActions = new Map<number, ActionTemplate>();
    actions.forEach((a) => {
      const inHit = a.in.has(piid);
      const outHit = a.out.has(piid);
      newActions.set(a.iid, (inHit || outHit)
        ? cloneAction(a, {
            in: inHit ? dropArgumentMapRefs(a.in, piid) : undefined,
            out: outHit ? dropArgumentMapRefs(a.out, piid) : undefined,
          })
        : a);
    });
    actions = newActions;
  }

  const referencedByEvent = Array.from(events.values()).some(e => e.arguments.has(piid));
  if (referencedByEvent) {
    const newEvents = new Map<number, EventTemplate>();
    events.forEach((e) => {
      newEvents.set(e.iid, e.arguments.has(piid)
        ? cloneEvent(e, {arguments: dropArgumentMapRefs(e.arguments, piid)})
        : e);
    });
    events = newEvents;
  }

  // 组合属性 members 引用该属性 → 去掉。
  const referencedByMember = Array.from(properties.values()).some(p => p.members?.includes(piid));
  if (referencedByMember) {
    const newProperties = new Map<number, PropertyTemplate>();
    properties.forEach((p) => {
      newProperties.set(p.iid, p.members?.includes(piid)
        ? cloneProperty(p, {members: p.members.filter(m => m !== piid)})
        : p);
    });
    properties.clear();
    newProperties.forEach((v, k) => properties.set(k, v));
  }

  return replaceService(device, serviceIid, cloneService(service, {properties, actions, events}));
}

export function removeAction(device: DeviceTemplate, serviceIid: number, actionIid: number): DeviceTemplate {
  const service = device.services.get(serviceIid);
  if (!service || !service.actions.has(actionIid)) return device;
  const actions = new Map(service.actions);
  actions.delete(actionIid);
  return replaceService(device, serviceIid, cloneService(service, {actions}));
}

export function removeEvent(device: DeviceTemplate, serviceIid: number, eventIid: number): DeviceTemplate {
  const service = device.services.get(serviceIid);
  if (!service || !service.events.has(eventIid)) return device;
  const events = new Map(service.events);
  events.delete(eventIid);
  return replaceService(device, serviceIid, cloneService(service, {events}));
}

/* ------------------------------------------------------------------ *
 * 增（复用现有 DeviceTemplateHelper / ServiceTemplateHelper，跑在克隆体上）
 * ------------------------------------------------------------------ */

export function addService(device: DeviceTemplate, op: Extract<TemplateOp, {kind: 'addService'}>): DeviceTemplate {
  const clone = cloneDevice(device, device.getServices());
  const helper = new DeviceTemplateHelper(clone, op.properties, op.actions, op.events);
  helper.addServiceDefinitions(op.defs, op.version);
  return clone;
}

function addToService(device: DeviceTemplate, serviceIid: number, run: (s: ServiceTemplate) => void): DeviceTemplate {
  const service = device.services.get(serviceIid);
  if (!service) return device;
  const clone = cloneService(service);
  run(clone);
  return replaceService(device, serviceIid, clone);
}

export function addProperties(device: DeviceTemplate, op: Extract<TemplateOp, {kind: 'addProperties'}>): DeviceTemplate {
  return addToService(device, op.serviceIid, (s) => {
    new ServiceTemplateHelper(s).addPropertyDefinitions(op.defs, op.version);
  });
}

export function addActions(device: DeviceTemplate, op: Extract<TemplateOp, {kind: 'addActions'}>): DeviceTemplate {
  return addToService(device, op.serviceIid, (s) => {
    new ServiceTemplateHelper(s, op.properties).addActionDefinitions(op.defs, op.version);
  });
}

export function addEvents(device: DeviceTemplate, op: Extract<TemplateOp, {kind: 'addEvents'}>): DeviceTemplate {
  return addToService(device, op.serviceIid, (s) => {
    new ServiceTemplateHelper(s, op.properties).addEventDefinitions(op.defs, op.version);
  });
}

/* ------------------------------------------------------------------ *
 * Reducer
 * ------------------------------------------------------------------ */

export function reduceTemplate(template: DeviceTemplate, op: TemplateOp): DeviceTemplate {
  switch (op.kind) {
    case 'setDeviceDescription':
      return setDeviceDescription(template, op.lang, op.value);
    case 'setDeviceLifecycle':
      return setDeviceLifecycle(template, op.lifecycle);

    case 'addService':
      return addService(template, op);
    case 'removeService':
      return removeService(template, op.serviceIid);
    case 'updateService':
      return updateService(template, op.serviceIid, op.patch);

    case 'addProperties':
      return addProperties(template, op);
    case 'addActions':
      return addActions(template, op);
    case 'addEvents':
      return addEvents(template, op);

    case 'removeProperty':
      return removeProperty(template, op.serviceIid, op.piid);
    case 'removeAction':
      return removeAction(template, op.serviceIid, op.actionIid);
    case 'removeEvent':
      return removeEvent(template, op.serviceIid, op.eventIid);

    case 'updateProperty':
      return updateProperty(template, op.serviceIid, op.piid, op.patch);
    case 'updateAction':
      return updateAction(template, op.serviceIid, op.actionIid, op.patch);
    case 'updateEvent':
      return updateEvent(template, op.serviceIid, op.eventIid, op.patch);

    default:
      return template;
  }
}
