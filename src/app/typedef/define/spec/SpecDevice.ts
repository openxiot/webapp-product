/**
 * {
 *                 "namespace": "xiot-spec",
 *                 "name": "curtain",
 *                 "uuid": "10",
 *                 "description": {
 *                     "en-US": "Curtain",
 *                     "zh-TW": "窗帘",
 *                     "zh-CN": "窗帘"
 *                 },
 *                 "lifecycle": "released",
 *                 "createBy": "",
 *                 "approveId": null,
 *                 "approveStatus": null,
 *                 "type": "urn:xiot-spec:device:curtain:00000010",
 *                 "createAt": 1659987293,
 *                 "modifyAt": 1659987293,
 *                 "category": null
 * },
 */

export class SpecDevice {

  namespace: string = '';
  name: string = '';
  uuid: string = '';
  lifecycle: string = '';
  type: string = '';
  description: Map<string, string> = new Map<string, string>();
}
