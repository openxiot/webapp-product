# 智能家居产品定义和接口

## 一、产品功能定义

### 1. 快速入门

#### 1.1 设备

在现实中，常见的物理设备基本都包含了诸多功能，如：

<u>Example 1.1</u>

| 设备  | 智米风扇    | 智米霾表     | 飞利浦灯泡  | 智米空气净化器  |
|-----|---------|----------|--------|----------|
| 功能1 | 可开关     | 可以查询空气质量 | 可开关    | 可开关      |
| 功能2 | 可调节风速   | 可充电      | 可调节亮度  | 可调节风速    |
| 功能3 | 可充电     | 可查询电量    | 可调节颜色  | 可查询滤芯生命值 |
| 功能4 | 可查询电量   | 可查询充电状态  | 可度调节色温 | 可查询空气质量  |
| 功能5 | 可查询充电状态 |          |        |          |

#### 1.2 功能分组

不同的设备的某些功能可能是一样的，比如：

* 智米风扇和智米霾表都有电池，都可以：
    * 充电
    * 查询电量
    * 查询充电状态
* 智米霾表和智米空气净化器都可以：
    * 查询空气质量
* 智米风扇和智米空气净化都可以：
    * 调节风速

为了方便，有必要对功能进行分组，比如：

* 电池
* 空气质量传感器
* 风扇

我们将功能组替换具体功能，那么Example 1.1可以写得更简洁：

<u>Example 1.2</u>

| 设备   | 智米电风扇 | 智米霾表    | 飞利浦灯泡 | 智米空气净化器 |
|------|-------|---------|:------|---------|
| 功能组1 | 风扇    | 空气质量传感器 | 灯泡    | 风扇      |
| 功能组2 | 电池    | 电池      |       | 空气质量传感器 |

#### 1.3 功能组定义

将功能组细化：

<u>Example 1.3</u>

| 功能组 | 风扇       | 电池      | 空气质量传感器   | 灯泡       |
|-----|----------|---------|-----------|----------|
| 功能1 | 可开关      | 可充电     | 可查询PM2.5值 | 可开关      |
| 功能2 | 可调节/查询风速 | 可查询充电状态 |           | 可调节/查询亮度 |
| 功能3 |          | 可查询当前电量 |           | 可调节/查询色温 |
|     |          |         |           | 可调节/查询颜色 |

#### 1.4 抽象设备描述

通过以上的功能分解，我们可以比较完整地描述一个设备具备的功能了：

* 智米电风扇
    * 风扇
        * 可开关
        * 可调节/查询风速
    * 电池
        * 可充电
        * 可查询充电状态
        * 可查询当前电量

用JSON来表达就是这样:

<u>Example 1.4.1</u>

```json
{
    "名称": "智米电风扇",
    "功能组": [
        {
            "名称": "风扇",
            "功能列表": ["可开关", "可调节/查询风速"]
        },
        {
            "名称": "电池",
            "功能列表": ["可充电", "可调节充电状态", "可查询当前电量"]
        }
    ]
}
```

还有些细节没有确定，比如说：

* 风速的调节到底是按档位来，还是无极变速？
* 电池的电量到底是用百分比表达，还是用毫安？

所以，如果我们把每个细节都确定下来，计算机就很方便处理了，Example 1.4.1可以改写得比较规范了：

<u>Example 1.4.2</u>

```json
{
    "type": "urn:joy-spec:device:fan:0000A005:zhimi:sa:1",
    "description": "Zhimi Fan",
    "services": [
        {
            "iid": 1,
            "type": "urn:joy-spec:service:fan:00007808:zhimi:sa:1",
            "description": "Fan",
            "properties": [
                {
                    "iid": 1,
                    "type": "urn:joy-spec:property:on:00000006:zhimi:sa:1",
                    "description": "Switch Status",
                    "format": "bool",
                    "access": ["read", "write", "notify"]
                },
                {
                    "iid": 2,
                    "type": "urn:joy-spec:property:fan-level:00000016:zhimi:sa:1",
                    "description": "Speed Level",
                    "format": "uint8",
                    "access": ["read", "write", "notify"],
                    "value-range": [1, 3, 1]
                }
            ]
        },
        {
            "iid": 2,
            "type": "urn:joy-spec:service:battery:00007805:zhimi:sa:1",
            "description": "Battery",
            "properties": [
                {
                    "iid": 1,
                    "type": "urn:joy-spec:property:battery-level:00000014:zhimi:sa:1",
                    "description": "Battery Level",
                    "format": "uint8",
                    "access": ["read", "notify"],
                    "value-range": [0, 100, 1],
                    "unit": "percentage"
                },
                {
                    "iid": 1,
                    "type": "urn:joy-spec:property:charging-state:00000015:zhimi:sa:1",
                    "description": "Charging State",
                    "format": "uint8",
                    "access": ["read", "notify"],
                    "value-list": [
                        {
                            "value": 0,
                            "description": "NOT_CHARGING"
                        },
                        {
                            "value": 1,
                            "description": "CHARGING"
                        },
                        {
                            "value": 2,
                            "description": "NOT_CHARGEABLE"
                        },
                    ]
                }
            ]
        }
    ]
}
```

### 2. 名词解释

- Specification

  规范，简写为spec


* joy-spec

  可扩展IoT规范


* 规范定义

  所谓的规范定义，指的是XIoT对设备功能的基本定义．


* 实例定义

  所谓的实例定义，指的是开发者最终的设备功能定义．


* type

  全称为Specification Type，即规范定义类型．


* device

  设备


* service

  服务，也可以理解为功能组


* property

  属性


* action

  方法


* event

  事件


* instance

  实例


* iid

  全称为instance id，实例id


* template

  模板

### 3. 产品规范

#### 3.1 简介

规范定义，分为：

* 设备规范定义
* 服务规范定义
* 方法规范定义
* 事件规范定义
* 属性规范定义
  <small>注: 在规范里，我们称功能组为“服务”</small>
  我们需要有一个字段来表达不同的定义，这个字段称之为SpecificationType

#### 3.2 SpecificationType

规范定义类型，简写为 type，必须是URN格式：

```
urn:joy-spec:service:device-information:00007801
```

* URN表达式

  URN表达式遵循URN语法规范(RFC2141)，6个字段，最后一个字段为可选：

  ```
  <URN> ::= "urn:"<ns>":"<type>":"<name>":"<value>[":"<vendor>:"<model>":"<version>]
  ```
    * urn

      第一个字段必须为urn，否则视为非法urn。

    * ns

      名字空间，如果是贝壳定义的规范为joy-spec，蓝牙联盟定义的规范为bluetooth-spec。

    * type

      SpecificationType (类型，简写为: type)，只能是如下几个：

        * template
        * property
        * action
        * event
        * service
        * device

    * name

      有意义的单词或单词组合(小写字母)，多个单词用"-"间隔，比如：

        * temperature
        * current-temperature
        * device-name
        * battery-level

    * value

      16进制字符串，使用UUID前8个字符，如：

        * 00002A06
        * 00002A00

    * vendor

      厂家，有意义的单词或单词组合(小写字母)，比如：

        * philips
        * aux-group

      ```
      注：这个字段只有在设备实例定义里出现。
      ```

    * model

      产品型号，有意义的单词或单词组合(小写字母)，比如：

        * c200
    * a6
        * mx-5

      ```
      注：这个字段只有在设备实例定义里出现。
      ```

    * version

      版本号，只能是自然数，如:

        * 1
        * 2
        * 3

      ```
      注：这个字段只有在设备实例定义里出现。
      ```

#### 3.3 设备品类

同一类设备被定义为同一个设备品类，如灯、开关等，使用一个urn表达式来表达：

- [x] type（SpecificationType, 简写为type）

  设备类型，必须是URN表达式，如：

  ```json
  "type": "urn:joy-spec:service:fan:00007808"
  ```

- [x] description（描述）

  对此Device做一个简单的描述，支持多语言：

  ```json
  "description": {
      "en_US": "Switch",
      "zh_CN": "开关",
      "zh_TW": "開關"
  }
  ```

#### 3.4 服务定义

服务是一个独立的有意义的功能组，描述一个服务，需要说清楚：

* 是什么服务？
* 有什么方法可以操作？
* 有什么事件可能会发生？
* 有哪些属性？

因此，服务规范定义需要包含如下字段：

- [x] type（SpecificationType, 简写为type）

  设备类型，必须是URN表达式，如：

   ```
   urn:joy-spec:service:fan:00007808
   ```


- [x] description（描述）

  纯文本字段，对此Service做一个简单的描述，如：

  ```
  Fan Service
  ```


- [ ] required-actions（必选方法列表）

  如：

   ```json
   "required-actions": [
       "urn:joy-spec:action:get-stream-configuration:00000001",
       "urn:joy-spec:action:start-stream:00000101",
       "urn:joy-spec:action:stop-stream:00000201"
   ]
   ```


- [ ] optional-actions（可选方法列表）

  如：

  ```json
  "optional-actions": [
      "urn:joy-spec:action:identify:00002801"
  ]
  ```


- [ ] required-events（必选事件列表）

  如：

  ```json
  "required-events": [
      "urn:joy-spec:event:alert1:00000007"
  ]
  ```

- [ ] optional-events（可选事件列表）

  如：

  ```json
  "optional-events": [
      "urn:joy-spec:event:alert2:00000008"
  ]
  ```


- [ ] required-properties（必选属性列表）

  如：

  ```json
  "required-properties": [
      "urn:joy-spec:property:on:00000006",
      "urn:joy-spec:property:fan-level:00000016"
  ]
  ```

- [ ] optional-properties（可选属性列表）

  如：

  ```json
  "optional-properties": [
      "urn:joy-spec:property:horizontal-swing:00000017",
      "urn:joy-spec:property:vertical-swing:00000018",
      "urn:joy-spec:property:horizontal-angle:00000019",
      "urn:joy-spec:property:vertical-angle:0000001A",
      "urn:joy-spec:property:mode:00000008",
      "urn:joy-spec:property:status:00000007",
      "urn:joy-spec:property:fault:00000009"
  ]
  ```

Example 2.4.1

```json
{
    "type": "urn:joy-spec:service:fan:00007808",
    "description": {
        "en_US": "Fan",
        "zh_CN": "风扇",
        "zh_TW": "風扇"
    },
    "required-properties": [
        "urn:joy-spec:property:on:00000006",
        "urn:joy-spec:property:fan-level:00000016"
    ],
    "optional-properties": [
        "urn:joy-spec:property:horizontal-swing:00000017",
        "urn:joy-spec:property:vertical-swing:00000018",
        "urn:joy-spec:property:horizontal-angle:00000019",
        "urn:joy-spec:property:vertical-angle:0000001A",
        "urn:joy-spec:property:mode:00000008",
        "urn:joy-spec:property:status:00000007",
        "urn:joy-spec:property:fault:00000009"
    ]
}
```

解读如下：

* 这是一个风扇服务


* 作为一个风扇，必须有的功能：
    - 开关
    - 调整风速
* 作为一个风扇，可选以下功能：
    * 名字
    * 旋转
    * 旋转角度
    * 禁用物理按键

当然，服务也可以稍微再复杂一点:

<u>Example 2.4.2</u>

```json
{
    "type": "urn:joy-spec:service:camera:00000007",
    "description": {
          "en_US": "Camera",
          "zh_CN": "摄像头",
        "zh_TW": "攝像頭"
    },
    "required-properties": [
        "urn:joy-spec:property-v2:streaming-status:00000004",
        "urn:joy-spec:property-v2:support-video-stream-configuration:00000002",
        "urn:joy-spec:property-v2:support-audio-stream-configuration:00000002",
        "urn:joy-spec:property-v2:support-rtp-stream-configuration:00000003",
        "urn:joy-spec:property-v2:session-id:00000102",
        "urn:joy-spec:property-v2:conroller-ip-version:00000103",
        "urn:joy-spec:property-v2:conroller-ip-address:00000104",
        "urn:joy-spec:property-v2:conroller-video-rtp-port:00000105",
        "urn:joy-spec:property-v2:conroller-audio-rtp-port:00000106",
        "urn:joy-spec:property-v2:selected-video-parameters:00000107",
        "urn:joy-spec:property-v2:selected-audio-parameters:00000108",
        "urn:joy-spec:property-v2:device-status:00000109",
        "urn:joy-spec:property-v2:device-ip-version:00000110",
        "urn:joy-spec:property-v2:device-ip-address:00000111",
        "urn:joy-spec:property-v2:synchronization-source-for-video:00000112",
        "urn:joy-spec:property-v2:synchronization-source-for-audio:00000113",
        "urn:joy-spec:property-v2:session-control:00000119"
    ],
    "required-actions": [
        "urn:joy-spec:action-v2:get-stream-configuration:00000001",
        "urn:joy-spec:action-v2:start-stream:00000101",
        "urn:joy-spec:action-v2:stop-stream:00000201"
    ],
    "optional-actions": [
        "urn:joy-spec:action:set-stream-configuration:00000009",
    ],
    "required-events": [
        "urn:joy-spec:event:alert:00000007"
    ],
    "optional-events": [
        "urn:joy-spec:event:warrning:00000008"
    ]
}
```

注意，与Example 2.4.1相比，多了几个字段：

* required-actions
* optional-actions
* required-events
* optional-events

#### 3. 5 方法定义

有时候，一个有意义的操作需要对多个属性进行读写，可以用方法来实现，描述一个方法，需要说清楚：

* 是什么方法？
* 输入参数是什么？
* 方法执行完有没有输出值，如果有，输出值什么？

因此，方法规范定义需要包含如下字段：

- [x] type （SpecificationType, 简写为type）

  设备类型，必须URN表达式，如：

  ```
  urn:joy-spec:action:play:0000280B
  ```

- [x] description（描述）

  纯文本字段，对此Action做一个简单的描述，如：

  ```
  Get Streaming Configuration Of Camera
  ```

- [ ] in（输入参数列表）

  可以是0到N个，每个参数都由属性组成，参数为可变参数，可以重复多次，也可以不出现。

- [ ] out（输出参数列表）

  可以是0到N个，每个参数都由属性组成，参数为可变参数，可以重复多次，也可以不出现。

<u>Example 2.5.1</u>  读取摄像头配置信息（需要一次读取多个属性）

```json
{
    "type": "urn:joy-spec:action:get-stream-configuration:00000001",
    "description": {
        "en_US": "Get Streaming Configuration Of Camera",
          "zh_CN": "从摄像头读取流配置信息",
        "zh_TW": "從攝像頭讀取流配置信息"
    },
    "in": [],
    "out": [
        {
            "type": "urn:joy-spec:property:streaming-status:00000004",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:support-video-stream-configuration:00000002",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:support-audio-stream-configuration:00000002",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:support-rtp-stream-configuration:00000003",
            "repeat": [1, 1]
        }
    ]
}
```

<u>Example 2.5.2</u> 开启摄像头视频流（需要设置SRTP相关的N个属性，返回SRTP相关的N个属性）

```json
{
    "type": "urn:joy-spec:action:start-stream:00000101",
    "description": {
        "en_US": "Start Camera Streaming",
        "zh_CN": "开启摄像头视频流",
          "zh_TW": "開啟攝像頭視頻流"
    },
    "in": [
        {
            "type": "urn:joy-spec:property:session-id:00000102",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:conroller-ip-version:00000103",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:conroller-ip-address:00000104",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:conroller-video-rtp-port:00000105",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:conroller-audio-rtp-port:00000106",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:selected-video-parameters:00000107",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:selected-audio-parameters:00000108",
            "repeat": [1, 1]
        }
    ],
    "out": [
        {
            "type": "urn:joy-spec:property:device-status:00000109",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:device-ip-version:00000110",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:device-ip-address:00000111",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:synchronization-source-for-video:00000112",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:synchronization-source-for-audio:00000113",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:session-control:00000119",
            "repeat": [1, 1]
        }
    ]
}
```

哪些情况下使用Action？

```
对于同时需要对多个属性的读写才能完成一次有意义的操作，用Action，如上文的开启摄像头视频流。
如果对某些属性的写操作很耗时，则用Action，status返回1，待操作完成后再用事件通知。
```

方法所引用的属性

```
方法在两种情况下引用到了属性定义，一种是参数列表中的数据，另一种是是返回结果列表的数据。
在目前的设计里，方法只能引用同服务内部的其他属性。
```

#### 3.6 事件定义

简单的事件，用属性的变化来通知用户。复杂的事件，需要用Event来表达:

* 发生了什么事情?
* 哪些属性发生了变化？

因此，事件规范定义需要包含如下字段：

- [x] type（SpecificationType, 简写为type）

  设备类型，必须是URN表达式，如：

  ```
  urn:miot-spec:spec:event:alert:00000007
  ```

- [x] description（描述）

  纯文本字段，对此事件做一个简单的描述，如：

  ```
  Get Streaming Configuration Of Camera
  ```

- [ ] arguments（参数列表）

  可以是0到N个，每个参数都由属性组成，参数为可变参数，可以重复多次，也可以不出现。

<u>Example 2.6</u>

```json
{
    "type": "urn:joy-spec:event:alert:00000007",
    "description": {
        "en_US": "alert alert alert!!!",
        "zh_CN": "警告",
          "zh_TW": "警告"
    },
    "arguments": [
        {
            “type”: "urn:joy-spec:property:name:00000002",
            "repeat": [1, 1]
        },
        {
            "type": "urn:joy-spec:property:temperature:00000003",
            "repeat": [0, 4]
        }
    ]
}
```

#### 3.7 属性定义

属性描述需要表达这几个意思:

* 语义是什么？
* 数据格式是什么？
* 是否可读？是否可写？数据变化了是否有通知？
* 值是否有约束？如果有，取值范围是离散值还是连续值？
* 单位是否定义？如果有定义，单位是什么？

因此，属性规范定义需要包含如下字段：

- [x] type （SpecificationType, 简写为type）

  设备类型，必须是URN表达式，如：

  ```
  urn:joy-spec:property:color-temperature:0000000F
  ```

- [x] description（描述）

  纯文本字段，对此事件做一个简单的描述，支持多语言，如：

  ```
  Name
  Temperature
  Current Temperature
  Temperature Display Units
  Battery Level
  Air Quality
  ```

- [x] format（(数据格式）

| 数据格式   | 描述                                | 备注       |
|--------|-----------------------------------|----------|
| bool   | 布尔值: true/false 或 1/0             |          |
| uint8  | 无符号8位整型                           | 建议约束取值范围 |
| uint16 | 无符号16位整型                          | 同上       |
| uint32 | 无符号32位整型                          | 同上       |
| int8   | 有符号8位整型                           | 同上       |
| int16  | 有符号16位整型                          | 同上       |
| int32  | 有符号32位整型                          | 同上       |
| int64  | 有符号64位整型                          | 同上       |
| float  | 浮点数                               | 同上       |
| string | 字符串                               | 建议约束最大长度 |
| hex    | 16进制，（使用字符串表示，如"FF0011", “EE00”等） | 建议约束取值范围 |
| object | 组合格式，包含多个属性                       |          |

- [x] access (访问方式)

| 值      | 描述 |
|--------|----|
| read   | 读  |
| write  | 写  |
| notify | 通知 |

- [ ] value-range (对取值范围进行约束，可选字段)

  当format为整型、浮点数或hex时，可定义value-range，比如：

| 最小值 | 最大值 | 步长  |
|-----|-----|-----|
| 16  | 32  | 0.5 |

用JSON数组表示：

```json
[16, 32, 0.5]
```

- [ ] value-list (对取值范围进行约束，可选字段)

  当format为整型，可定义"value-list"，每个元素都包含：

    * value
    * description

  用JSON数组表示，如:

  ```json
  [
    {"value": 1, "description": "Monday"},
    {"value": 2, "description": "Tuesday"},
    {"value": 3, "description": "Wednesday"},
    {"value": 4, "description": "Thursday"},
    {"value": 5, "description": "Friday"},
    {"value": 6, "description": "Saturday"},
    {"value": 7, "description": "Sunday"}
  ]
  ```

- [ ] unit (单位，可选字段)

  当format为整型或浮点型，可定义unit值：

| 值          | 描述          |
|------------|-------------|
| percentage | 百分比         |
| celsius    | 摄氏度         |
| seconds    | 秒           |
| minutes    | 分           |
| hours      | 小时          |
| days       | 天           |
| kelvin     | 开氏温标        |
| pascal     | 帕斯卡(大气压强单位) |
| arcdegrees | 弧度(角度单位)    |
| rgb        | RGB(颜色)     |
| watt       | 瓦特(功率)      |
| litre      | 升           |
| ppm        | ppm浓度       |
| lux        | 勒克斯(照度)     |
| mg/m3      | 毫克每立方米      |

- [ ] max-length (字符串最大长度)
  可选字段，仅当format为字符串时可选。

- [ ] members（成员）

  可选字段，仅当format为object时才出现，如：

  ```json
  {
      "type": "urn:xiot-spec:property:hsv:00000040",
      "description": "HSV",
      "format": "object",
      "access": ["read", "write", "notify"],
      "members": [
          "urn:xiot-spec:property:hue:00000041",
          "urn:xiot-spec:property:saturation:00000042",
          "urn:xiot-spec:property:brightness:00000043"
      ]
  }

<u>Example 2.7.1</u> 最简单的定义

```json
{
    "type": "urn:joy-spec:property:device-name:00000001",
    "description": "Device Name",
    "format": "string",
    "access": ["read"],
    "max-length": 16
}
```

<u>Example 2.7.2</u> 使用value-range和unit

```json
{
    "type": "urn:joy-spec:property:current-temperature:00000002",
    "description": "Current temperature",
    "format": "float",
    "access": ["read", "write", "notify"],
    "value-range": [16, 32, 0.5],
    "unit": "celsius"
}
```

<u>Example 2.7.3</u> 使用value-list

```json
{
    "type": "urn:joy-spec:property:day-of-the-week:00000003",
    "description": "Day Of The Week",
    "format": "uint8",
    "access": ["read", "write", "notify"],
    "value-list": [
       {"value": 1, "description": "Monday"},
       {"value": 2, "description": "Tuesday"},
       {"value": 3, "description": "Wednesday"},
       {"value": 4, "description": "Thursday"},
       {"value": 5, "description": "Friday"},
       {"value": 6, "description": "Saturday"},
       {"value": 7, "description": "Sunday"}
    ]
}
```

### 4. 模板

在设备模板中，规定了哪些功能是必须的，哪些功能是可选的；

同样，在设备模板的功能里，规定了哪些属性是可选的，哪些属性是必须的。

具体产品必须继承自一个产品模板。

### 5. 实例定义

#### 5.1 实例ID(Instance ID，简称iid)

对于一个实际生产的物理设备，我们称之为设备实例(Device Instance)，每个型号的设备具备的功能应该是一样的。也就是说：

* Device包含哪些Service是确定的.
* Service包含哪些Action/Event/Property也是确定的。

所以：**在一个设备实例的定义中，可选的东西是不存在的。**

在同一个设备中，有可能出现功能重复的定义，比如：

* 插座中有N个插孔
* 净水器有N个滤芯

也就是说：

* 一个Property可能存在多个实例
* 一个Action可能存在多个实例
* 一个Service也可能存在多个实例。

为了区分不同的实例，需要引入一个概念：**iid（实例ID）**

iid用整型表示，一个iid在同一级是唯一的，所谓的“iid在同一级唯一”的意思是：

* 在一个Device中，Service的iid是唯一的。
* 在一个Service的properties中，Property的iid是唯一的。
* 在一个Service的actions中，Action的iid是唯一的。
* 在一个Service的events中，Event的iid是唯一的。

#### 5.2 创建产品实例

在产品实例定义中使用规范定义（Property/Action/Event/Service/Device）时，往往需要修改规范定义。比如：

* 风扇的档位由规范定义的5个档位，修改为10个档位。
* 空调的温度由规范定义的16-32度，修改为15-33度。

因此需要引入一个概念: **继承**。
在type字段加上后缀，表示此定义已经被继承，比如：

* 规范定义的属性（speed-level，定义了5个档位）

```json
{
    "type": "urn:joy-spec:property:speed-level:00000023",
    "description": "Speed Level",
    "format": "uint8",
    "access": ["read", "write", "notify"],
    "value-range": [1, 5, 1]
}
```

* 智米做了一款风扇，继承了这个属性，修改风扇的档位为10档

```json
{
    "type": "urn:joy-spec:property:speed-level:00000003:zhimi-v1:1",
    "description": "Speed Level",
    "format": "uint8",
    "access": ["read", "write","notify"],
    "value-range": [1, 10, 1]
}
```

* 奥克斯也做了一款风扇，继承此属性后，修改了风扇的档位为3档：

```json
{
    "type": "urn:joy-spec:property:speed-level:00000003:auxgroup-ff:1",
    "description": "Speed Level",
    "format": "uint8",
    "access": ["read", "write", "notify"],
    "value-range": [1, 3, 1]
}
```

厂家使用继承方式，可以自定义：

* Device
* Service
* Action
* Event
* Property

##### 5.2.1 Device

设备实例必须是继承方式，如：

```
urn:joy-spec:device:light:0000A001:tuya02-tywl1:1
urn:joy-spec:device:air-conditioner:0000A004:aden-a1:1
urn:joy-spec:device:air-conditioner:0000A004:aux-v1:1
urn:joy-spec:device:outlet:0000A002:chuangmi-hmi205:1
urn:joy-spec:device:outlet:0000A002:chuangmi-m1:1
urn:joy-spec:device:outlet:0000A002:chuangmi-v3:1
urn:joy-spec:device:cooker:0000A00B:chunmi-normal2:
```

厂家创建一个设备时，必须实现：

* required-services

可以实现

* optional-services

同时，厂家可以添加其他的service。

##### 5.2.2 Service

在Service实例中，必须实现：

* required-actions
* required-events
* required-properties

可以实现

* optional-actions
* optional-events
* optional-properties

##### 5.2.3 Action

在Action实例中，in和out参数可以被修改。

##### 5.2.4 Event

在Event实例中，argument参数可以被修改。

如果参数被修改，则此Event实例属于继承方式，需要加上后缀字段。

##### 5.2.5 Property

在Property实例中，以下字段都可以被修改：

* format
* access (不推荐修改)
* unit (不推荐修改)
* value-list
* value-range
* max-length
* members

当然，一般情况下，我们只推荐修改值的约束范围。

**特别注意：如果修改了format，则value-list/value-range/max-length等字段也需要跟着调整。**

#### 5.3 范例

用一个文件描述整个设备，由于是一个实例定义，所以Service和Property都有自己的"iid"。

* 灯泡实例定义

```json
{
    "type": "urn:joy-spec:device:light:0000A001:vw:cc:1",
    "description": "Light",
    "services": [
        {
            "iid": 1,
            "type": "urn:joy-spec:service:device-information:00007801:vw:cc:1",
            "description": "Device Information",
            "properties": [
                {
                    "iid": 1,
                    "type": "urn:joy-spec:property:manufacturer:00000001:vw:cc:1",
                    "description": "Device Manufacturer",
                    "format": "string",
                    "access": [
                        "read"
                    ]
                },
                {
                    "iid": 2,
                    "type": "urn:joy-spec:property:model:00000002:vw:cc:1",
                    "description": "Device Model",
                    "format": "string",
                    "access": [
                        "read"
                    ]
                },
                {
                    "iid": 3,
                    "type": "urn:joy-spec:property:serial-number:00000003:vw:cc:1",
                    "description": "Device Serial Number",
                    "format": "string",
                    "access": [
                        "read"
                    ]
                },
                {
                    "iid": 4,
                    "type": "urn:joy-spec:property:name:00000004:vw:cc:1",
                    "description": "Device Name",
                    "format": "string",
                    "access": [
                        "read"
                    ]
                },
                {
                    "iid": 5,
                    "type": "urn:joy-spec:property:firmware-revision:00000005:vw:cc:1",
                    "description": "Current Firmware Version",
                    "format": "string",
                    "access": [
                        "read"
                    ]
                }
            ]
        },
        {
            "iid": 2,
            "type": "urn:joy-spec:service:light:00007802:vw:cc:1",
            "description": "Light",
            "properties": [
                {
                    "iid": 1,
                    "type": "urn:joy-spec:property:on:00000006:vw:cc:1",
                    "description": "Switch Status",
                    "format": "bool",
                    "access": [
                        "read",
                        "write",
                        "notify"
                    ]
                },
                {
                    "iid": 2,
                    "type": "urn:joy-spec:property:brightness:0000000D:vw:cc:1",
                    "description": "Brightness",
                    "format": "uint8",
                    "access": [
                        "read",
                        "write",
                        "notify"
                    ],
                    "value-range": [
                        1,
                        100,
                        1
                    ],
                    "unit": "percentage"
                },
                {
                    "iid": 3,
                    "type": "urn:joy-spec:property:color:0000000E:vw:cc:1",
                    "description": "Color",
                    "format": "uint32",
                    "access": [
                        "read",
                        "write",
                        "notify"
                    ],
                    "value-range": [
                        0,
                        16777215,
                        1
                    ],
                    "unit": "rgb"
                },
                {
                    "iid": 4,
                    "type": "urn:joy-spec:property:color-temperature:0000000F:vw:cc:1",
                    "description": "Color Temperature",
                    "format": "uint32",
                    "access": [
                        "read",
                        "write",
                        "notify"
                    ],
                    "value-range": [
                        1700,
                        6500,
                        1
                    ],
                    "unit": "kelvin"
                }
            ]
        }
    ]
}
```

### 6. 产品实例升级

物理设备的固件升级后，可能：

1. 仅仅是修复内部bug。
2. 增加了设备功能。

对于第1种情况，我们不关心。

对于第2种情况，我们需要规定好升级方式。

比如一款风扇升级过N个固件，更改了3次功能，这3次升级都修改了设备实例的type：

```
urn:joy-spec:device:fan:0000A005:vw:cc:1
urn:joy-spec:device:fan:0000A005:vw:cc:2
urn:joy-spec:device:fan:0000A005:vw:cc:3
```

#### 6.1 升级约定

* 升级版本号，需要向下兼容，即：
    * 只能添加功能，不能删除和修改旧功能。

* 如果更改了产品型号，则不需要考虑兼容。

* 绝大多数情况下，不建议升级产品型号。

#### 6.2 范例

* 初始版本定义

  当一个设备刚被创建的时候，版本号是1，如：

  ```json
  {
      "type": "urn:joy-spec:device:fan:0000A005:vw:cc:1",
      "description": "Zhimi Fan",
      "services": [
          {
              "iid": 1,
              "type": "urn:joy-spec:service:fan:00007808:vw:cc:1",
              "description": "Fan",
              "properties": [
                  {
                      "iid": 1,
                      "type": "urn:joy-spec:property:on:00000006:vw:cc:1",
                      "description": "Switch Status",
                      "format": "bool",
                      "access": ["read", "write", "notify"]
                  },
                  {
                      "iid": 2,
                      "type": "urn:joy-spec:property:fan-level:00000016:vw:cc:1",
                      "description": "Speed Level",
                      "format": "uint8",
                      "access": ["read", "write", "notify"],
                      "value-range": [1, 3, 1]
                  }
              ]
          }
      ]
  }
  ```

  注意:

    * 设备实例中的type是

      ```
      urn:joy-spec:device:fan:0000A005:vw:cc:1
      ```

    * 风速被厂家修改了取值范围，type是

      ```
      urn:joy-spec:property:fan-level:00000016:vw:cc:1
      ```

    * 两个type的后缀保持一致，都是:

      ```
      zhimi:zxc:1
      ```


* 升级

  过了一段时间，厂家觉得3档太少，需要升级下固件，支持5个档位。设备实例被修改成：

  ```json
  {
      "type": "urn:joy-spec:device:fan:0000A005:vw:cc:2",
      "description": "Zhimi Fan",
      "services": [
          {
              "iid": 1,
              "type": "urn:joy-spec:service:fan:00007808:vw:cc:1",
              "description": "Fan",
              "properties": [
                  {
                      "iid": 1,
                      "type": "urn:joy-spec:property:on:00000006:vw:cc:1",
                      "description": "Switch Status",
                      "format": "bool",
                      "access": ["read", "write", "notify"]
                  },
                  {
                      "iid": 2,
                      "type": "urn:joy-spec:property:fan-level:00000016:vw:cc:1",
                      "description": "Speed Level",
                      "format": "uint8",
                      "access": ["read", "write", "notify"],
                      "value-range": [1, 3, 1]
                  },
                  {
                      "iid": 3,
                      "type": "urn:joy-spec:property:fan-level:00000016:vw:cc:2",
                      "description": "Speed Level",
                      "format": "uint8",
                      "access": ["read", "write", "notify"],
                      "value-range": [1, 5, 1]
                  }
              ]
          }
      ]
  }
  ```

  注意:

    * 设备实例中的type是（版本号变成了2）：

      ```
      urn:joy-spec:device:fan:0000A005:vw:cc:2
      ```

    * 原有的风速（fan-level）type依旧不变（这是一个在版本1时定义的风速）

      ```
      urn:joy-spec:property:fan-level:00000016:vw:cc:1
      ```

    * 新增加了一个风速（iid:  3，版本号是2），档位被调整为5档，type是:

      ```
      urn:joy-spec:property:fan-level:00000016:vw:cc:2
      ```

## 二、设备操作

操作一个设备，需要发送HTTP消息到192.168.43.134:8080端口。

### 名词解释

* did

  设备ID，设备唯一标识符，字符串

* siid

  服务实例ID，自然数

* piid

  属性实例ID，自然数

* aiid

  方法实例ID，自然数

* eiid

  事件实例ID，自然数

* pid

  属性ID，由did，siid，piid组成，用字符点间隔。

* aid

  方法ID，由did，siid，aiid组成，用字符点间隔。

* eid

  事件ID，由did，siid，eiid组成，用字符点间隔。

* status

  状态码，0代表成功，负数代表错误。

### 1.1 读属性

* 请求（一次可以读多个属性值）

    ```json
    GET /device/v1/properties?pid={pid},{pid}
    ```

* 应答（body

    ```json
    {
      "msg":"ok",
      "data": [
        {
          	"pid": "{pid}",
          	"value": {value}
        }
      ]
    }
    ```

​ 其中，msg: "ok"，表示请求执行完成。

### 1.2 写属性

* 请求（一次可以写多个属性值）

    ```json
    PUT /device/v1/properties
    
    [
    	{
    		"pid": "{pid}",
    		"value": {value}
    	}
    ]
    ```

* 应答（body）

    ```json
    {
      "msg": "ok",
      "data": [
        {
          "pid":"{pid}",
          "status":0
        }
      ]
    }
    ```

### 1.3 执行方法

* 请求

    ```http
    PUT /device/v1/actions
    
    [
        {
            "aid": "{aid}",
            "in": [
                {
                    "piid": {piid},
                    "values": [
                        {value}
                    ]
                }
            ]
        }
    ]
    ```

* 应答

    ```json
    {
        "msg": "ok",
        "data": [
            {
                "aid": "{aid}",
                "status": 0,
                "out": [
                    {
                        "piid": {piid},
                        "values": [
                            {value}
                        ]
                    },
                    {
                        "piid": {piid},
                        "values": [
                            {value}
                        ]
                    }
                ]
            }
        ]
    }
    ```