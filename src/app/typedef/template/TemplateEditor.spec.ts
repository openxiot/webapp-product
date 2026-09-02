import {
  Access,
  ActionDefinition,
  ActionTemplate,
  ActionType,
  Argument,
  ArgumentDefinition,
  DataFormat,
  DeviceTemplate,
  DeviceType,
  EventDefinition,
  EventTemplate,
  EventType,
  LifeCycle,
  PropertyDefinition,
  PropertyTemplate,
  PropertyType,
  ServiceDefinition,
  ServiceTemplate,
  ServiceType,
} from '@openxiot/xiot-core-spec-ts';
import {
  addActions,
  addProperties,
  addService,
  reduceTemplate,
  removeEvent,
  removeProperty,
  removeService,
  setDeviceDescription,
  setDeviceLifecycle,
  updateAction,
  updateEvent,
  updateProperty,
  updateService,
} from './TemplateEditor';

/**
 * Phase 1 spec：TemplateEditor 纯不可变层。
 *
 * 核心断言都围绕「结构共享 + 沿变更路径换新引用」：
 *  - 被改的那条分支换新对象、未动的兄弟保持原引用；
 *  - 原 device/子树绝不被原地修改；
 *  - iid 冲突 / 目标缺失 → 返回【同一个】device（no-op，身份不变）。
 *
 * 纯函数测试，无 DOM，不需要 zoneless fixture。
 */

const ORG = 'org1';
const MODEL = 'model1';

/** 基础（命名空间级）URN：供 add* 定义使用，helper 追加 org/model/version。 */
const ptDef = (name: string) => new PropertyType(`urn:test:property:${name}:00000000`);
const atDef = (name: string) => new ActionType(`urn:test:action:${name}:00000000`);
const etDef = (name: string) => new EventType(`urn:test:event:${name}:00000000`);
const stDef = (name: string) => new ServiceType(`urn:test:service:${name}:00000000`);

/** 已带 org/model/version 的类型：直接 fixture 使用。 */
const pt = (name: string) => new PropertyType(`urn:test:property:${name}:00000000:${ORG}:${MODEL}:1`);
const st = (name: string) => new ServiceType(`urn:test:service:${name}:00000000:${ORG}:${MODEL}:1`);

function propDef(name: string, format: DataFormat = DataFormat.FLOAT): PropertyDefinition {
  const def = new PropertyDefinition(ptDef(name), new Map([['zh-CN', name]]));
  def.format = format;
  def.access = Access.of(true, true, true);
  return def;
}

/** S1：P1(10 humidity),P2(20 temperature),P3(30 combination members[10]),A1(100 in/out),A2(200),E1(300 args[10])。 */
function makeDevice(): {
  device: DeviceTemplate;
  s1: ServiceTemplate;
  s2: ServiceTemplate;
  p1: PropertyTemplate;
  p2: PropertyTemplate;
  p3: PropertyTemplate;
  a1: ActionTemplate;
  a2: ActionTemplate;
  e1: EventTemplate;
} {
  const p1 = new PropertyTemplate(10, pt('humidity'), new Map([['zh-CN', '湿度']]), DataFormat.FLOAT,
    Access.of(true, true, true), null, null, [], true, '');
  const p2 = new PropertyTemplate(20, pt('temperature'), new Map([['zh-CN', '温度']]), DataFormat.FLOAT,
    Access.of(true, true, true), null, null, [], false, '');
  const p3 = new PropertyTemplate(30, pt('coord'), new Map([['zh-CN', '坐标']]), DataFormat.COMBINATION,
    Access.of(true, false, true), null, null, [10], false, '');

  const a1 = new ActionTemplate(100, true, new ActionType(`urn:test:action:read:00000000:${ORG}:${MODEL}:1`),
    new Map([['zh-CN', '读']]),
    [Argument.of(10, 1, 1)], [Argument.of(20, 1, 1)], '');
  const a2 = new ActionTemplate(200, false, new ActionType(`urn:test:action:write:00000000:${ORG}:${MODEL}:1`),
    new Map([['zh-CN', '写']]), [], [], '');

  const e1 = new EventTemplate(300, true, new EventType(`urn:test:event:report:00000000:${ORG}:${MODEL}:1`),
    new Map([['zh-CN', '上报']]), [Argument.of(10, 1, 1)], '');

  const s1 = new ServiceTemplate(1, true, st('lights'), new Map([['zh-CN', '灯']]),
    [p1, p2, p3], [a1, a2], [e1], false, false, false, '');
  const s2 = new ServiceTemplate(2, false, st('switch'), new Map([['zh-CN', '开关']]), [], [], [], false, false, false, '');

  const device = new DeviceTemplate(new DeviceType(`urn:test:device:mymodel:00000000:${ORG}:${MODEL}:1`),
    new Map([['zh-CN', '我的设备']]), [s1, s2]);
  return {device, s1, s2, p1, p2, p3, a1, a2, e1};
}

describe('TemplateEditor（纯不可变层）', () => {

  describe('updateProperty', () => {
    it('required 变更：只重建 device→S1→P1，兄弟全部保持原引用，原 device 未被原地改', () => {
      const {device, s1, s2, p1, p2, p3, a1, a2, e1} = makeDevice();
      const result = updateProperty(device, 1, 10, {required: false});

      expect(result).not.toBe(device);
      const newS1 = result.services.get(1)!;
      expect(newS1).not.toBe(s1);
      const newP1 = newS1.properties.get(10)!;
      expect(newP1).not.toBe(p1);
      expect(newP1.required).toBe(false);

      // 结构共享：S2 与 S1 内未动兄弟引用不变
      expect(result.services.get(2)).toBe(s2);
      expect(newS1.properties.get(20)).toBe(p2);
      expect(newS1.properties.get(30)).toBe(p3);
      expect(newS1.actions.get(100)).toBe(a1);
      expect(newS1.actions.get(200)).toBe(a2);
      expect(newS1.events.get(300)).toBe(e1);

      // 原 device 未被原地修改
      expect(device).toBeTruthy();
      expect(s1.properties.get(10)!.required).toBe(true);
      expect(device.services.get(1)).toBe(s1);
    });

    it('description 只替换属性的 description Map，不动其它字段', () => {
      const {device, p1, p2} = makeDevice();
      const desc = new Map([['zh-CN', '新湿度描述']]);
      const result = updateProperty(device, 1, 10, {description: desc});
      const newP1 = result.services.get(1)!.properties.get(10)!;
      expect(newP1.description).toBe(desc);
      expect(newP1.iid).toBe(10);
      expect(newP1.format).toBe(p1.format);
      expect(newP1.access).toBe(p1.access);
      expect(newP1.required).toBe(p1.required);
      expect(result.services.get(1)!.properties.get(20)).toBe(p2);
    });

    it('access 变更保持其它属性引用', () => {
      const {device, p2} = makeDevice();
      const result = updateProperty(device, 1, 10, {access: Access.of(false, true, false)});
      const newP1 = result.services.get(1)!.properties.get(10)!;
      expect(newP1.access.isWritable).toBe(true);
      expect(newP1.access.isReadable).toBe(false);
      expect(result.services.get(1)!.properties.get(20)).toBe(p2);
    });

    it('iid 变更：properties 重排 key，action.in/event.arguments 及组合 members 引用改写，原对象不动', () => {
      const {device, s1, a1, e1, p3} = makeDevice();
      const result = updateProperty(device, 1, 10, {iid: 99});
      expect(result).not.toBe(device);

      const newS1 = result.services.get(1)!;
      expect(newS1.properties.has(10)).toBe(false);
      expect(newS1.properties.has(99)).toBe(true);
      expect(newS1.properties.get(99)!.iid).toBe(99);

      // action.in 的 key 与 Argument.piid 都被改写；out 的 20 不受影响
      const newA1 = newS1.actions.get(100)!;
      expect(newA1).not.toBe(a1);
      expect(newA1.in.has(99)).toBe(true);
      expect(newA1.in.has(10)).toBe(false);
      expect([...newA1.in.values()][0].piid).toBe(99);
      expect(newA1.out.has(20)).toBe(true);
      expect([...newA1.out.values()][0].piid).toBe(20);
      // 不引用 10 的 action 保持原引用
      expect(newS1.actions.get(200)).toBe(s1.actions.get(200));

      // event.arguments 改写
      const newE1 = newS1.events.get(300)!;
      expect(newE1).not.toBe(e1);
      expect(newE1.arguments.has(99)).toBe(true);
      expect(newE1.arguments.has(10)).toBe(false);

      // 组合 members 改写
      const newP3 = newS1.properties.get(30)!;
      expect(newP3).not.toBe(p3);
      expect(newP3.members).toEqual([99]);

      // 原 device / S1 / A1 完全未被原地改
      expect(s1.properties.has(10)).toBe(true);
      expect(a1.in.has(10)).toBe(true);
      expect(e1.arguments.has(10)).toBe(true);
      expect(device.services.get(2)).toBeDefined();
    });

    it('iid 冲突（改成同容器已有值）→ no-op，返回同一个 device', () => {
      const {device} = makeDevice();
      const result = updateProperty(device, 1, 10, {iid: 20});
      expect(result).toBe(device);
      expect(device.services.get(1)!.properties.has(10)).toBe(true);
    });

    it('目标 service/piid 缺失 → no-op，返回同一个 device', () => {
      const {device} = makeDevice();
      expect(updateProperty(device, 99, 10, {required: false})).toBe(device);
      expect(updateProperty(device, 1, 999, {required: false})).toBe(device);
    });
  });

  describe('updateAction / updateEvent / updateService', () => {
    it('updateAction patch 后 action 换新、兄弟引用不变、required 持久化', () => {
      const {device, a1, a2, p1} = makeDevice();
      const result = updateAction(device, 1, 100, {required: false});
      const newS1 = result.services.get(1)!;
      const newA1 = newS1.actions.get(100)!;
      expect(newA1).not.toBe(a1);
      expect(newA1.required).toBe(false);
      expect(newS1.actions.get(200)).toBe(a2);
      expect(newS1.properties.get(10)).toBe(p1);
      expect(a1.required).toBe(true);
    });

    it('updateAction iid 冲突 → no-op', () => {
      const {device} = makeDevice();
      expect(updateAction(device, 1, 100, {iid: 200})).toBe(device);
    });

    it('updateEvent 替换 arguments 整 Map 并重建事件', () => {
      const {device, e1, p1} = makeDevice();
      const args = new Map<number, Argument>([[20, Argument.of(20, 1, 1)]]);
      const result = updateEvent(device, 1, 300, {arguments: args});
      const newE1 = result.services.get(1)!.events.get(300)!;
      expect(newE1).not.toBe(e1);
      // 构造器按 iid 重建 Map：内容一致且复用原 Argument 对象引用
      expect(newE1.arguments.size).toBe(1);
      expect(newE1.arguments.has(20)).toBe(true);
      expect(newE1.arguments.get(20)).toBe(args.get(20));
      expect(result.services.get(1)!.properties.get(10)).toBe(p1);
    });

    it('updateAction 替换 in 整 Map（改 min/max + 新增参数）：in 持久化、out/兄弟引用稳定、原 a1 不被改', () => {
      const {device, a1, a2, p1} = makeDevice();
      // 模拟 action.detail 序列化行后的整 Map 提交：10 改 maxRepeat=2，并新增 30
      const newIn = new Map<number, Argument>([
        [10, Argument.of(10, 1, 2)],
        [30, Argument.of(30, 1, 1)],
      ]);
      const result = updateAction(device, 1, 100, {in: newIn});
      const newS1 = result.services.get(1)!;
      const newA1 = newS1.actions.get(100)!;
      expect(newA1).not.toBe(a1);
      expect(newA1.in.size).toBe(2);
      expect(newA1.in.get(10)).toBe(newIn.get(10));       // 参数对象按 patch 原样入库
      expect(newA1.in.get(10)!.maxRepeat).toBe(2);
      expect(newA1.in.get(30)!.piid).toBe(30);
      // 未动的 out 方向保留原 Argument 对象、兄弟 action/属性引用不变
      expect(newA1.out.size).toBe(1);
      expect(newA1.out.get(20)).toBe(a1.out.get(20));
      expect(newS1.actions.get(200)).toBe(a2);
      expect(newS1.properties.get(10)).toBe(p1);
      // 原 a1 未被原地改
      expect(a1.in.get(10)!.maxRepeat).toBe(1);
      expect(a1.in.has(30)).toBe(false);
    });

    it('updateEvent 替换 arguments 整 Map（去掉旧参 10、新增 20）：克隆反映增删、原 e1 不被改', () => {
      const {device, e1, a2} = makeDevice();
      const args = new Map<number, Argument>([[20, Argument.of(20, 2, 3)]]);
      const result = updateEvent(device, 1, 300, {arguments: args});
      const newE1 = result.services.get(1)!.events.get(300)!;
      expect(newE1).not.toBe(e1);
      expect(newE1.arguments.size).toBe(1);
      expect(newE1.arguments.has(10)).toBe(false);        // 旧参数随 Map 替换被删除
      expect(newE1.arguments.get(20)).toBe(args.get(20)); // 新参数入库（min/max 持久化）
      expect(newE1.arguments.get(20)!.maxRepeat).toBe(3);
      expect(result.services.get(1)!.actions.get(200)).toBe(a2);
      expect(e1.arguments.has(20)).toBe(false);           // 原 e1 未被原地改
      expect(e1.arguments.has(10)).toBe(true);
    });

    it('updateService description / addables patch 换新服务、device 顶层重排、兄弟服务引用稳定', () => {
      const {device, s1, s2} = makeDevice();
      const desc = new Map([['zh-CN', '灯V2']]);
      const result = updateService(device, 1, {description: desc, propertyAddable: true});
      const newS1 = result.services.get(1)!;
      expect(newS1).not.toBe(s1);
      expect(newS1.description).toBe(desc);
      expect(newS1.propertyAddable).toBe(true);
      expect(result.services.get(2)).toBe(s2);
      expect(s1.description.get('zh-CN')).toBe('灯');
    });

    it('updateService iid 变更：顶层 Map 重排到新 key，原服务/原 device 不被原地改', () => {
      const {device, s1, s2} = makeDevice();
      const result = updateService(device, 1, {iid: 50});
      expect(result).not.toBe(device);
      expect(result.services.has(1)).toBe(false);
      const renamed = result.services.get(50)!;
      expect(renamed).not.toBe(s1);
      expect(renamed.iid).toBe(50);
      // 兄弟服务引用稳定，未改名服务的子树引用不变
      expect(result.services.get(2)).toBe(s2);
      // 原 device 未被原地改
      expect(device.services.has(1)).toBe(true);
    });

    it('updateService iid 冲突（改成现有服务 iid）→ no-op，返回同一个 device', () => {
      const {device} = makeDevice();
      expect(updateService(device, 1, {iid: 2})).toBe(device);
    });
  });

  describe('removeProperty（含引用清理）', () => {
    it('删除引用该属性的 action/event 参数项与组合 members', () => {
      const {device, s1, a1, e1, p3, p2} = makeDevice();
      const result = removeProperty(device, 1, 10);
      const newS1 = result.services.get(1)!;
      expect(newS1.properties.has(10)).toBe(false);

      const newA1 = newS1.actions.get(100)!;
      expect(newA1).not.toBe(a1);
      expect(newA1.in.size).toBe(0);
      expect(newA1.out.size).toBe(1); // 20 不受影响
      expect(newA1.out.has(20)).toBe(true);

      const newE1 = newS1.events.get(300)!;
      expect(newE1).not.toBe(e1);
      expect(newE1.arguments.size).toBe(0);

      const newP3 = newS1.properties.get(30)!;
      expect(newP3).not.toBe(p3);
      expect(newP3.members).toEqual([]);

      // 兄弟引用稳定 + 原对象未被原地改
      expect(newS1.properties.get(20)).toBe(p2);
      expect(s1.properties.has(10)).toBe(true);
      expect(a1.in.has(10)).toBe(true);
      expect(e1.arguments.has(10)).toBe(true);
    });

    it('删除无引用的属性只删该属性', () => {
      const {device, a1} = makeDevice();
      const result = removeProperty(device, 1, 30);
      const newS1 = result.services.get(1)!;
      expect(newS1.properties.has(30)).toBe(false);
      expect(newS1.actions.get(100)).toBe(a1); // 无引用 → 原引用
      expect(result.services.get(1)!.properties.get(10)).toBe(device.services.get(1)!.properties.get(10));
    });

    it('目标 piid 缺失 → no-op', () => {
      const {device} = makeDevice();
      expect(removeProperty(device, 1, 999)).toBe(device);
      expect(removeProperty(device, 99, 10)).toBe(device);
    });
  });

  describe('removeService / removeAction / removeEvent', () => {
    it('removeService 只去掉 S2，S1 保持原引用', () => {
      const {device, s1} = makeDevice();
      const result = removeService(device, 2);
      expect(result).not.toBe(device);
      expect(result.services.has(2)).toBe(false);
      expect(result.services.get(1)).toBe(s1);
      expect(device.services.has(2)).toBe(true);
    });

    it('removeService 目标缺失 → no-op', () => {
      const {device} = makeDevice();
      expect(removeService(device, 99)).toBe(device);
    });

    it('removeAction / removeEvent 只重建受影响容器', () => {
      const {device, a2} = makeDevice();
      const r1 = reduceTemplate(device, {kind: 'removeAction', serviceIid: 1, actionIid: 100});
      expect(r1).not.toBe(device);
      expect(r1.services.get(1)!.actions.has(100)).toBe(false);
      expect(r1.services.get(1)!.actions.get(200)).toBe(a2);

      const r2 = removeEvent(device, 1, 300);
      expect(r2.services.get(1)!.events.has(300)).toBe(false);
    });
  });

  describe('设备级 setDeviceDescription / setDeviceLifecycle', () => {
    it('setDeviceDescription 换新顶层、description 为新的 Map、服务引用稳定、原 Map 不被改', () => {
      const {device, s1, s2} = makeDevice();
      const result = setDeviceDescription(device, 'zh-CN', '改名后的设备');
      expect(result).not.toBe(device);
      expect(result.services.get(1)).toBe(s1);
      expect(result.services.get(2)).toBe(s2);
      expect(result.description.get('zh-CN')).toBe('改名后的设备');
      expect(device.description.get('zh-CN')).toBe('我的设备');
    });

    it('setDeviceLifecycle 换新顶层、lifecycle 更新、服务引用稳定、原 lifecycle 不变', () => {
      const {device, s1} = makeDevice();
      const result = setDeviceLifecycle(device, LifeCycle.RELEASED);
      expect(result).not.toBe(device);
      expect(result.lifecycle).toBe(LifeCycle.RELEASED);
      expect(result.services.get(1)).toBe(s1);
      expect(device.lifecycle).not.toBe(LifeCycle.RELEASED);
    });
  });

  describe('add（跑在克隆体上，复用现有 helper）', () => {
    function emptyDevice(): DeviceTemplate {
      return new DeviceTemplate(new DeviceType(`urn:test:device:mymodel:00000000:${ORG}:${MODEL}:1`),
        new Map([['zh-CN', '我的设备']]), []);
    }

    it('addProperties 只动 S1 克隆：新增属性 iid 递增，原 S1/原 device 不被改', () => {
      const {device, p1, p2} = makeDevice();
      const defs = [propDef('co2', DataFormat.UINT8)];
      const result = addProperties(device, {kind: 'addProperties', serviceIid: 1, defs, version: 1});
      expect(result).not.toBe(device);
      const newS1 = result.services.get(1)!;
      const added = newS1.properties.get(31)!;
      expect(added.iid).toBe(31);
      expect(added.format).toBe(DataFormat.UINT8);
      expect(added.required).toBe(true);
      expect(added.type.name).toBe('co2');
      // 原有属性引用不变
      expect(newS1.properties.get(10)).toBe(p1);
      expect(newS1.properties.get(20)).toBe(p2);
      // 原 device 未被改
      expect(device.services.get(1)!.properties.has(31)).toBe(false);
      // 无关服务引用不变
      expect(result.services.get(2)).toBe(device.services.get(2));
    });

    it('addProperties 目标服务缺失 → no-op', () => {
      const {device} = makeDevice();
      expect(addProperties(device, {kind: 'addProperties', serviceIid: 99, defs: [], version: 1})).toBe(device);
    });

    it('addActions：in/out 参数正确解析到已有属性（验证 helper 的 out 修复），原 device 不被改', () => {
      const {device} = makeDevice();
      const actDef = new ActionDefinition(atDef('read'), new Map([['zh-CN', '读']]),
        [], [new ArgumentDefinition(ptDef('temperature'))]);
      const defs = [actDef];
      // temperature 已在 S1(piid 20) → 走 findProperty，不依赖外带属性定义 map
      const result = addActions(device, {kind: 'addActions', serviceIid: 1, defs, version: 1, properties: new Map()});

      const newS1 = result.services.get(1)!;
      const added = newS1.actions.get(201)!;
      // 既有属性 temperature(20) 已存在 → 走 findProperty，不重复加属性
      expect(added.in.size).toBe(0);
      expect(added.out.size).toBe(1); // 修复前 out 为空、in 会重复 20
      expect([...added.out.values()][0].piid).toBe(20);
      expect(newS1.properties.size).toBe(3); // 未新增属性
      // 原 device 未被改
      expect(device.services.get(1)!.actions.has(201)).toBe(false);
      expect(device.services.get(1)!.properties.size).toBe(3);
    });

    it('addActions：in 引用 service 外定义的属性时补充该属性并返回其 piid', () => {
      const {device} = makeDevice();
      const actDef = new ActionDefinition(atDef('run'), new Map([['zh-CN', '运行']]),
        [new ArgumentDefinition(ptDef('speed'))], []);
      const defs = [actDef];
      const result = addActions(device, {kind: 'addActions', serviceIid: 1, defs, version: 1,
        properties: new Map([['speed', propDef('speed', DataFormat.UINT16)]])});
      const newS1 = result.services.get(1)!;
      const added = newS1.actions.get(201)!;
      expect(added.in.size).toBe(1);
      const piid = [...added.in.values()][0].piid;
      expect(piid).toBe(31); // 属性 iid 递增到 31，参数指向它
      expect(newS1.properties.get(31)!.type.name).toBe('speed');
    });

    it('addService：走 DeviceTemplateHelper 加服务，requiredEvents 在前 / optionalEvents 在后（验证 helper 修复）', () => {
      const device = emptyDevice();
      const hum = ptDef('humidity');
      const evtAlarm = etDef('alarm');
      const evtTick = etDef('tick');

      const def = new ServiceDefinition(stDef('lights'), new Map([['zh-CN', '灯']]),
        [hum], [], [], [], [evtAlarm], [evtTick]);

      // DeviceTemplateHelper 用 events 定义 map 解析 def.required/optionalEvents 的 EventType
      const alarmDef = new EventDefinition(etDef('alarm'), new Map([['zh-CN', '告警']]), []);
      const tickDef = new EventDefinition(etDef('tick'), new Map([['zh-CN', '滴答']]), []);

      const result = addService(device, {kind: 'addService', defs: [def], version: 1,
        properties: new Map([['humidity', propDef('humidity', DataFormat.FLOAT)]]),
        actions: new Map(),
        events: new Map([[alarmDef.type.name, alarmDef], [tickDef.type.name, tickDef]])});

      expect(result).not.toBe(device);
      // getMaxServiceIID() 下限为 1 → 空设备加的首个服务 iid = 2（沿用现有 helper 行为）
      const svc = result.services.get(2)!;
      expect(svc).toBeTruthy();
      expect(svc.type.name).toBe('lights');
      expect(svc.required).toBe(false);
      expect(svc.properties.size).toBe(1);
      expect(svc.properties.get(1)!.required).toBe(true);
      expect(svc.properties.get(1)!.type.name).toBe('humidity');

      // 修复前：连遍 optionalEvents 两遍 → 两个 tick；修复后：alarm(required) + tick(optional)
      const events = svc.getEvents();
      expect(events.length).toBe(2);
      expect(events[0].type.name).toBe('alarm');
      expect(events[0].required).toBe(true);
      expect(events[1].type.name).toBe('tick');
      expect(events[1].required).toBe(false);

      expect(device.services.size).toBe(0); // 原 device 未被改
    });
  });

  describe('reduceTemplate 分发', () => {
    it('文本类 op 等价于直接调用；目标 iid 缺失的 op 返回同一个 t', () => {
      const {device} = makeDevice();
      const r1 = reduceTemplate(device, {kind: 'setDeviceDescription', lang: 'zh-CN', value: 'X'});
      const r2 = setDeviceDescription(device, 'zh-CN', 'X');
      expect(r1.description.get('zh-CN')).toBe(r2.description.get('zh-CN'));
      expect(r1).not.toBe(r2); // 各自独立克隆

      expect(reduceTemplate(device, {kind: 'updateService', serviceIid: 99,
        patch: {description: new Map()}})).toBe(device);
      expect(reduceTemplate(device, {kind: 'updateProperty', serviceIid: 1, piid: 999,
        patch: {required: false}})).toBe(device);
    });
  });
});
