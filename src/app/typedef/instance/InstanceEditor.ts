import {
  Access,
  Action,
  Argument,
  ConstraintValue,
  DataFormat,
  DeviceInstance,
  Event,
  LifeCycle,
  Property,
  PropertyValue,
  Service,
} from '@openxiot/xiot-core-spec-ts';

/**
 * 产品实例详情编辑树的「不可变操作」层（对齐 typedef/template/TemplateEditor.ts 的方法论）。
 *
 * 领域对象（DeviceInstance/Service/Property/Action/Event）是可变的普通类，
 * 这里提供一组纯函数：所有模型改动都收敛成 InstanceOp，reducer 用「沿变更路径
 * 重建新引用（结构共享）」产出新的 DeviceInstance——被改的那条分支换新对象，
 * 未动的兄弟保持原引用。这样 Zoneless 下每个读方因「自己的 signal input / computed
 * 值变化」而被标记脏并重绘，不再依赖 Default 级联或手动 detectChanges()。
 *
 * 约定（与模板同）：
 *  - 除本文件外的任何代码不再对共享模型做原地修改。
 *  - 目标 iid 缺失（或 iid 变更与同容器已有值冲突）时返回【同一个】instance（no-op）。
 *  - description Map / 参数 Argument / type urn 未改时保持【共享同一引用】，绝不复制。
 *  - code（type.name）仍可编辑：改名时用 renameUrn 按段重建 URN 生成新的 type 子类对象。
 *  - Property 克隆基于 Property.copy（保住 value/PropertyValue 与默认值）；改 format 时
 *    旧 DataValue 失效 → value 换新 PropertyValue(format)。
 */

/* ------------------------------------------------------------------ *
 * Patch 类型（字段全部可选：缺省 = 保持原值；null 用 'field' in patch 判定）
 * ------------------------------------------------------------------ */

export interface ServicePatch {
  /** 变更服务 iid：克隆后由顶层 DeviceInstance 构造器按新 iid 重建 Map（自动重排 key）。 */
  iid?: number;
  /** 变更服务 code（type.name）。 */
  name?: string;
  description?: Map<string, string>;
}

export interface PropertyPatch {
  /** 变更属性 iid：见 updateProperty 的冲突守卫与同服务内参数/members 引用改写。 */
  iid?: number;
  /** 变更属性 code（type.name）。 */
  name?: string;
  description?: Map<string, string>;
  access?: Access;
  format?: DataFormat;
  /** null = 无取值约束(ConstraintType.NONE)；提供 null 时必须显式带上此字段。 */
  constraintValue?: ConstraintValue | null;
  unit?: string | null;
  /** 组合属性成员 piid 列表（编辑端先克隆数组再发）。 */
  members?: number[];
  /** 默认值：null = 清除；否则按当前 format 重建 DataValue（走 Property.setDefaultValue）。 */
  defaultValue?: any | null;
}

export interface ActionPatch {
  iid?: number;
  name?: string;
  description?: Map<string, string>;
  /** 整体替换输入参数 Map（编辑端已基于克隆的 Argument 重建好）。 */
  in?: Map<number, Argument>;
  out?: Map<number, Argument>;
}

export interface EventPatch {
  iid?: number;
  name?: string;
  description?: Map<string, string>;
  arguments?: Map<number, Argument>;
}

/* ------------------------------------------------------------------ *
 * InstanceOp：唯一允许的「改动词汇表」
 * ------------------------------------------------------------------ */

export type InstanceOp =
  | { kind: 'setInstanceLifecycle'; lifecycle: LifeCycle }

  | { kind: 'addService'; service: Service }
  | { kind: 'removeService'; serviceIid: number }
  | { kind: 'updateService'; serviceIid: number; patch: ServicePatch }

  | { kind: 'addProperties'; serviceIid: number; properties: Property[] }
  | { kind: 'addActions'; serviceIid: number; actions: Action[] }
  | { kind: 'addEvents'; serviceIid: number; events: Event[] }

  | { kind: 'removeProperty'; serviceIid: number; piid: number }
  | { kind: 'removeAction'; serviceIid: number; actionIid: number }
  | { kind: 'removeEvent'; serviceIid: number; eventIid: number }

  | { kind: 'updateProperty'; serviceIid: number; piid: number; patch: PropertyPatch }
  | { kind: 'updateAction'; serviceIid: number; actionIid: number; patch: ActionPatch }
  | { kind: 'updateEvent'; serviceIid: number; eventIid: number; patch: EventPatch };

/* ------------------------------------------------------------------ *
 * 基础 clone 助手（结构共享的唯一实现点）
 * ------------------------------------------------------------------ */

function cloneDevice(instance: DeviceInstance, services: Service[]): DeviceInstance {
  const d = new DeviceInstance(instance.type, instance.description, services);
  d.lifecycle = instance.lifecycle;
  return d;
}

/** 改名 code：按段重建 URN 生成同类 type 子类对象；未变/非法输入返回原对象。 */
function renameUrn<T>(type: T, name: string): T {
  const anyType = type as ({ toString(): string } | null | undefined);
  if (!anyType) return type;
  const parts = anyType.toString().split(':');
  if (parts.length < 5) return type;
  const clean = name.trim().toLowerCase();
  if (!clean || parts[3] === clean) return type;
  const ctor = (type as { constructor: new (s: string) => T }).constructor;
  parts[3] = clean;
  return new ctor(parts.join(':'));
}

interface ServiceOverrides {
  iid?: number;
  name?: string;
  description?: Map<string, string>;
  properties?: Map<number, Property>;
  actions?: Map<number, Action>;
  events?: Map<number, Event>;
}

function cloneService(service: Service, over: ServiceOverrides = {}): Service {
  return new Service(
    over.iid ?? service.iid,
    'name' in over ? renameUrn(service.type, over.name as string) : service.type,
    over.description ?? service.description,
    Array.from((over.properties ?? service.properties).values()),
    Array.from((over.actions ?? service.actions).values()),
    Array.from((over.events ?? service.events).values()),
  );
}

interface PropertyOverrides {
  iid?: number;
  name?: string;
  description?: Map<string, string>;
  access?: Access;
  format?: DataFormat;
  constraintValue?: ConstraintValue | null;
  unit?: string | null;
  members?: number[];
}

function cloneProperty(p: Property, over: PropertyOverrides = {}): Property {
  const copy = Property.copy(p); // 新对象 + 整份 PropertyValue（保默认值/当前值）
  const format = over.format ?? p.format;

  if ('iid' in over) copy.iid = over.iid as number;
  if ('name' in over) copy.type = renameUrn(p.type, over.name as string);
  if ('description' in over) copy.description = over.description as Map<string, string>;
  if ('access' in over) copy.access = over.access as Access;
  if ('unit' in over) copy.unit = over.unit as string | null;
  if ('members' in over) copy.members = over.members as number[];

  if (format !== p.format) {
    // 格式一变，旧 format 的 PropertyValue/取值约束失效 → 换新格式的干净值。
    copy.format = format;
    copy.value = new PropertyValue(format);
    copy.constraintValue = 'constraintValue' in over ? (over.constraintValue as ConstraintValue | null) : null;
  } else if ('constraintValue' in over) {
    copy.constraintValue = over.constraintValue as ConstraintValue | null;
  }

  return copy;
}

function cloneArgument(piid: number, a: Argument): Argument {
  return Argument.of(piid, a.minRepeat, a.maxRepeat);
}

interface ActionOverrides {
  iid?: number;
  name?: string;
  description?: Map<string, string>;
  in?: Map<number, Argument>;
  out?: Map<number, Argument>;
}

function cloneAction(a: Action, over: ActionOverrides = {}): Action {
  return new Action(
    over.iid ?? a.iid,
    'name' in over ? renameUrn(a.type, over.name as string) : a.type,
    over.description ?? a.description,
    Array.from((over.in ?? a.in).values()),
    Array.from((over.out ?? a.out).values()),
  );
}

interface EventOverrides {
  iid?: number;
  name?: string;
  description?: Map<string, string>;
  arguments?: Map<number, Argument>;
}

function cloneEvent(e: Event, over: EventOverrides = {}): Event {
  return new Event(
    over.iid ?? e.iid,
    'name' in over ? renameUrn(e.type, over.name as string) : e.type,
    over.description ?? e.description,
    Array.from((over.arguments ?? e.arguments).values()),
  );
}

/** 唯一交换点：把 serviceIid 对应的服务替换为 newService，其余服务引用保持不变。 */
function replaceService(instance: DeviceInstance, serviceIid: number, newService: Service): DeviceInstance {
  return cloneDevice(instance, instance.getServices().map(s => (s.iid === serviceIid ? newService : s)));
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
 * 实例级
 * ------------------------------------------------------------------ */

export function setInstanceLifecycle(instance: DeviceInstance, lifecycle: LifeCycle): DeviceInstance {
  const d = cloneDevice(instance, instance.getServices());
  d.lifecycle = lifecycle;
  return d;
}

export function removeService(instance: DeviceInstance, serviceIid: number): DeviceInstance {
  if (!instance.services.has(serviceIid)) return instance;
  return cloneDevice(instance, instance.getServices().filter(s => s.iid !== serviceIid));
}

export function updateService(instance: DeviceInstance, serviceIid: number, patch: ServicePatch): DeviceInstance {
  const service = instance.services.get(serviceIid);
  if (!service) return instance;
  const newIid = patch.iid ?? serviceIid;
  // 冲突守卫：服务 iid 不能改成同容器内已存在的值，否则顶层 Map 会因重排 key 静默吞并。
  if (newIid !== serviceIid && instance.services.has(newIid)) return instance;
  return replaceService(instance, serviceIid, cloneService(service, patch));
}

/* ------------------------------------------------------------------ *
 * 属性 / 方法 / 事件
 * ------------------------------------------------------------------ */

/**
 * 变更属性 iid 时重写「同服务内对该 piid 的引用」：
 *  - action.in / action.out、event.arguments 的 key 与 Argument.piid：old → new；
 *  - 其它（组合）属性的 members 数组：old → new。
 */
function rekeyPropertyReferences(
  properties: Map<number, Property>,
  actions: Map<number, Action>,
  events: Map<number, Event>,
  oldPiid: number,
  newPiid: number,
): { properties: Map<number, Property>; actions: Map<number, Action>; events: Map<number, Event> } {
  const newProperties = new Map<number, Property>();
  properties.forEach((p) => {
    if (p.members && p.members.includes(oldPiid)) {
      newProperties.set(p.iid, cloneProperty(p, {members: p.members.map(m => (m === oldPiid ? newPiid : m))}));
    } else {
      newProperties.set(p.iid, p);
    }
  });

  const newActions = new Map<number, Action>();
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

  const newEvents = new Map<number, Event>();
  events.forEach((e) => {
    if (e.arguments.has(oldPiid)) {
      newEvents.set(e.iid, cloneEvent(e, {arguments: rewriteArgumentMap(e.arguments, oldPiid, newPiid)}));
    } else {
      newEvents.set(e.iid, e);
    }
  });

  return {properties: newProperties, actions: newActions, events: newEvents};
}

export function updateProperty(instance: DeviceInstance, serviceIid: number, piid: number, patch: PropertyPatch): DeviceInstance {
  const service = instance.services.get(serviceIid);
  const p = service?.properties.get(piid);
  if (!service || !p) return instance;

  const newIid = patch.iid ?? piid;
  // 冲突守卫：不能改成同容器内已存在的值。
  if (newIid !== piid && service.properties.has(newIid)) return instance;

  // cloneProperty 按「字段是否在 over 中」判定，缺省 = 共享原引用；iid 常显式带。
  const over: PropertyOverrides = {
    ...('name' in patch ? {name: patch.name as string} : {}),
    ...('description' in patch ? {description: patch.description as Map<string, string>} : {}),
    ...('access' in patch ? {access: patch.access as Access} : {}),
    ...('format' in patch ? {format: patch.format as DataFormat} : {}),
    ...('constraintValue' in patch ? {constraintValue: patch.constraintValue as ConstraintValue | null} : {}),
    ...('unit' in patch ? {unit: patch.unit as string | null} : {}),
    ...('members' in patch ? {members: patch.members as number[]} : {}),
    iid: newIid,
  };
  const newProperty = cloneProperty(p, over);

  // 默认值走 model API：null = 清除，否则按当前 format 建 DataValue。
  if ('defaultValue' in patch) {
    if (patch.defaultValue == null) {
      newProperty.value.defaultValue = null;
    } else {
      newProperty.setDefaultValue(patch.defaultValue);
    }
  }

  const properties = new Map(service.properties);
  properties.delete(piid);
  properties.set(newIid, newProperty);

  if (newIid !== piid) {
    const rewritten = rekeyPropertyReferences(properties, service.actions, service.events, piid, newIid);
    return replaceService(instance, serviceIid, cloneService(service, rewritten));
  }

  return replaceService(instance, serviceIid, cloneService(service, {properties}));
}

export function updateAction(instance: DeviceInstance, serviceIid: number, actionIid: number, patch: ActionPatch): DeviceInstance {
  const service = instance.services.get(serviceIid);
  const action = service?.actions.get(actionIid);
  if (!service || !action) return instance;

  const newIid = patch.iid ?? actionIid;
  if (newIid !== actionIid && service.actions.has(newIid)) return instance;

  const actions = new Map(service.actions);
  actions.delete(actionIid);
  actions.set(newIid, cloneAction(action, {...patch, iid: newIid}));

  return replaceService(instance, serviceIid, cloneService(service, {actions}));
}

export function updateEvent(instance: DeviceInstance, serviceIid: number, eventIid: number, patch: EventPatch): DeviceInstance {
  const service = instance.services.get(serviceIid);
  const event = service?.events.get(eventIid);
  if (!service || !event) return instance;

  const newIid = patch.iid ?? eventIid;
  if (newIid !== eventIid && service.events.has(newIid)) return instance;

  const events = new Map(service.events);
  events.delete(eventIid);
  events.set(newIid, cloneEvent(event, {...patch, iid: newIid}));

  return replaceService(instance, serviceIid, cloneService(service, {events}));
}

/**
 * 删除属性时同时清理同服务内对它的悬空引用（参数条目与组合 members）。
 * 行为变更：旧代码原地 delete 后 action/event 参数会残留失效 piid。
 */
export function removeProperty(instance: DeviceInstance, serviceIid: number, piid: number): DeviceInstance {
  const service = instance.services.get(serviceIid);
  if (!service || !service.properties.has(piid)) return instance;

  const properties = new Map(service.properties);
  properties.delete(piid);

  let actions = service.actions;
  let events = service.events;

  // 引用该属性的 action/event → 克隆并去掉对应参数条目。
  const referencedByAction = Array.from(actions.values()).some(a => a.in.has(piid) || a.out.has(piid));
  if (referencedByAction) {
    const newActions = new Map<number, Action>();
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
    const newEvents = new Map<number, Event>();
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
    const newProperties = new Map<number, Property>();
    properties.forEach((p) => {
      newProperties.set(p.iid, p.members?.includes(piid)
        ? cloneProperty(p, {members: p.members.filter(m => m !== piid)})
        : p);
    });
    properties.clear();
    newProperties.forEach((v, k) => properties.set(k, v));
  }

  return replaceService(instance, serviceIid, cloneService(service, {properties, actions, events}));
}

export function removeAction(instance: DeviceInstance, serviceIid: number, actionIid: number): DeviceInstance {
  const service = instance.services.get(serviceIid);
  if (!service || !service.actions.has(actionIid)) return instance;
  const actions = new Map(service.actions);
  actions.delete(actionIid);
  return replaceService(instance, serviceIid, cloneService(service, {actions}));
}

export function removeEvent(instance: DeviceInstance, serviceIid: number, eventIid: number): DeviceInstance {
  const service = instance.services.get(serviceIid);
  if (!service || !service.events.has(eventIid)) return instance;
  const events = new Map(service.events);
  events.delete(eventIid);
  return replaceService(instance, serviceIid, cloneService(service, {events}));
}

/* ------------------------------------------------------------------ *
 * 增（负载为各 create 弹窗建好的节点对象，克隆目标服务后本地 set）
 * ------------------------------------------------------------------ */

function addToService(instance: DeviceInstance, serviceIid: number, run: (s: Service) => void): DeviceInstance {
  const service = instance.services.get(serviceIid);
  if (!service) return instance;
  const clone = cloneService(service);
  run(clone);
  return replaceService(instance, serviceIid, clone);
}

export function addProperties(instance: DeviceInstance, op: Extract<InstanceOp, {kind: 'addProperties'}>): DeviceInstance {
  const {serviceIid, properties} = op;
  if (properties.length === 0) return instance;
  // 目标服务已存在某 piid → 冲突，no-op。
  const service = instance.services.get(serviceIid);
  if (!service) return instance;
  for (const p of properties) {
    if (service.properties.has(p.iid)) return instance;
  }
  return addToService(instance, serviceIid, s => {
    for (const p of properties) {
      s.properties.set(p.iid, p);
    }
  });
}

export function addActions(instance: DeviceInstance, op: Extract<InstanceOp, {kind: 'addActions'}>): DeviceInstance {
  const {serviceIid, actions} = op;
  if (actions.length === 0) return instance;
  const service = instance.services.get(serviceIid);
  if (!service) return instance;
  for (const a of actions) {
    if (service.actions.has(a.iid)) return instance;
  }
  return addToService(instance, serviceIid, s => {
    for (const a of actions) {
      s.actions.set(a.iid, a);
    }
  });
}

export function addEvents(instance: DeviceInstance, op: Extract<InstanceOp, {kind: 'addEvents'}>): DeviceInstance {
  const {serviceIid, events} = op;
  if (events.length === 0) return instance;
  const service = instance.services.get(serviceIid);
  if (!service) return instance;
  for (const e of events) {
    if (service.events.has(e.iid)) return instance;
  }
  return addToService(instance, serviceIid, s => {
    for (const e of events) {
      s.events.set(e.iid, e);
    }
  });
}

export function addService(instance: DeviceInstance, op: Extract<InstanceOp, {kind: 'addService'}>): DeviceInstance {
  const {service} = op;
  if (instance.services.has(service.iid)) return instance;
  const services = instance.getServices();
  services.push(service);
  return cloneDevice(instance, services);
}

/* ------------------------------------------------------------------ *
 * Reducer
 * ------------------------------------------------------------------ */

export function reduceInstance(instance: DeviceInstance, op: InstanceOp): DeviceInstance {
  switch (op.kind) {
    case 'setInstanceLifecycle':
      return setInstanceLifecycle(instance, op.lifecycle);

    case 'addService':
      return addService(instance, op);
    case 'removeService':
      return removeService(instance, op.serviceIid);
    case 'updateService':
      return updateService(instance, op.serviceIid, op.patch);

    case 'addProperties':
      return addProperties(instance, op);
    case 'addActions':
      return addActions(instance, op);
    case 'addEvents':
      return addEvents(instance, op);

    case 'removeProperty':
      return removeProperty(instance, op.serviceIid, op.piid);
    case 'removeAction':
      return removeAction(instance, op.serviceIid, op.actionIid);
    case 'removeEvent':
      return removeEvent(instance, op.serviceIid, op.eventIid);

    case 'updateProperty':
      return updateProperty(instance, op.serviceIid, op.piid, op.patch);
    case 'updateAction':
      return updateAction(instance, op.serviceIid, op.actionIid, op.patch);
    case 'updateEvent':
      return updateEvent(instance, op.serviceIid, op.eventIid, op.patch);

    default:
      return instance;
  }
}
