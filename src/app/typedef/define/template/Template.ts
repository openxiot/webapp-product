import {DeviceType, LifeCycle} from '@openxiot/xiot-core-spec-ts';

/**
 * {
 *                 "device": "light",
 *                 "description": {
 *                     "en-US": "磁吸泛光灯Z3",
 *                     "zh-CN": "磁吸泛光灯Z3"
 *                 },
 *                 "lifecycle": "released",
 *                 "createBy": "",
 *                 "approveId": null,
 *                 "approveStatus": null,
 *                 "namespace": "xiot-spec",
 *                 "name": "light",
 *                 "uuid": "12",
 *                 "type": "urn:xiot-spec:device:light:00000012:jd:z3_light05:1",
 *                 "createAt": 1659987293,
 *                 "modifyAt": 1659987293
 *             }
 */
export class Template {

  constructor(
    public type: DeviceType,
    public description: Map<string, string> = new Map<string, string>(),
    public lifecycle: LifeCycle = LifeCycle.DEVELOPMENT,
  ) {
  }
}
