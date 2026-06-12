import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {lastValueFrom, map, Observable} from "rxjs";
import {JoyResponse} from "./response/JoyResponse";
import {SpecDevice} from '../typedef/define/spec/SpecDevice';
import {SpecDeviceCodec} from '../typedef/codec/spec/SpecDeviceCodec';
import {SpecUnits} from '../typedef/define/spec/SpecUnits';
import {SpecUnitsCodec} from '../typedef/codec/spec/SpecUnitsCodec';
import {SpecFormats} from '../typedef/define/spec/SpecFormats';
import {SpecFormatsCodec} from '../typedef/codec/spec/SpecFormatsCodec';
import {SpecProperties} from '../typedef/define/spec/SpecProperties';
import {SpecPropertiesCodec} from '../typedef/codec/spec/SpecPropertiesCodec';
import {SpecActions} from '../typedef/define/spec/SpecActions';
import {SpecActionsCodec} from '../typedef/codec/spec/SpecActionsCodec';
import {SpecEvents} from '../typedef/define/spec/SpecEvents';
import {SpecEventsCodec} from '../typedef/codec/spec/SpecEventsCodec';
import {SpecServices} from '../typedef/define/spec/SpecServices';
import {SpecServicesCodec} from '../typedef/codec/spec/SpecServicesCodec';
import {SpecTemplatesCodec} from '../typedef/codec/template/SpecTemplatesCodec';
import {SpecTemplates} from '../typedef/define/template/SpecTemplates';
import {
  DeviceInstanceCodec,
  DeviceInstanceWithLifecycleCodec,
  DeviceTemplate,
  DeviceTemplateWithLifecycleCodec,
  LifeCycle,
  ObjectWithLifecycle,
  ProductBasic,
  ProductBasicCodec,
  ProductFirmware,
  ProductFirmwareCodec,
  ProductFirmwareInstance,
  ProductFirmwareInstanceCodec,
  ProductInstance,
  ProductInstanceCodec,
  ProductManual,
  ProductManualCodec,
  ProductPanel,
  ProductPanelCodec,
  ProductWizard,
  ProductWizardCodec,
  DeviceInstance
} from '@openxiot/xiot-core-spec-ts';
import {JoyProducts} from '../typedef/define/product/JoyProducts';
import {JoyProductsCodec} from '../typedef/codec/product/JoyProductsCodec';
import {OSSUpload} from '../typedef/define/upload/OSSUpload';
import {OSSUploadCodec} from '../typedef/codec/upload/OSSUploadCodec';
import {Developer} from '../typedef/define/user/Developer';
import {DeveloperCodec} from '../typedef/codec/user/DeveloperCodec';

@Injectable({providedIn: 'root'})
export class MainService {
  private server: string = environment.server;

  constructor(
    private http: HttpClient
  ) {
  }

  /**------------------------------------------------------------------------------------------------
   * 开发者
   *------------------------------------------------------------------------------------------------*/
  getDeveloper(pin: string): Observable<Developer> {
    const params = {
      pin: pin,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v1/user`, {params})
      .pipe(map(response => DeveloperCodec.decode(response.data)));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品规范
   *------------------------------------------------------------------------------------------------*/

  getSpecDevices(organizationCode: string, pageNum: number, pageSize: number): Observable<SpecDevice[]> {
    const params = {
      organizationCode: organizationCode,
      pageNum: pageNum,
      pageSize: pageSize
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v1/spec/device/list`, {params})
      .pipe(map(response => SpecDeviceCodec.decodeArray(response.data.datalist)));
  }

  getSpecServices(organizationCode: string, pageNum: number, pageSize: number): Observable<SpecServices> {
    const params = {
      organizationCode: organizationCode,
      pageNum: pageNum,
      pageSize: pageSize
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v1/spec/service/list`, {params})
      .pipe(map(response => SpecServicesCodec.decode(response.data)));
  }

  getSpecActions(organizationCode: string, pageNum: number, pageSize: number): Observable<SpecActions> {
    const params = {
      organizationCode: organizationCode,
      pageNum: pageNum,
      pageSize: pageSize
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v1/spec/action/list`, {params})
      .pipe(map(response => SpecActionsCodec.decode(response.data)));
  }

  getSpecEvents(organizationCode: string, pageNum: number, pageSize: number): Observable<SpecEvents> {
    const params = {
      organizationCode: organizationCode,
      pageNum: pageNum,
      pageSize: pageSize
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v1/spec/event/list`, {params})
      .pipe(map(response => SpecEventsCodec.decode(response.data)));
  }

  getSpecProperties(organizationCode: string, pageNum: number, pageSize: number): Observable<SpecProperties> {
    const params = {
      organizationCode: organizationCode,
      pageNum: pageNum,
      pageSize: pageSize
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v1/spec/property/list`, {params})
      .pipe(map(response => SpecPropertiesCodec.decode(response.data)));
  }

  getSpecFormats(organizationCode: string, pageNum: number, pageSize: number): Observable<SpecFormats> {
    const params = {
      organizationCode: organizationCode,
      pageNum: pageNum,
      pageSize: pageSize
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v1/spec/format/list`, {params})
      .pipe(map(response => SpecFormatsCodec.decode(response.data)));
  }

  getSpecUnits(organizationCode: string, pageNum: number, pageSize: number): Observable<SpecUnits> {
    const params = {
      organizationCode: organizationCode,
      pageNum: pageNum,
      pageSize: pageSize
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v1/spec/unit/list`, {params})
      .pipe(map(response => SpecUnitsCodec.decode(response.data)));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品模板
   *------------------------------------------------------------------------------------------------*/

  /**
   * 读取产品模板列表
   */
  getTemplates(organizationCode: string, pageNum: number, pageSize: number): Observable<SpecTemplates> {
    const params = {
      organizationCode: organizationCode,
      pageNum: pageNum,
      pageSize: pageSize
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v1/template/list`, {params})
      .pipe(map(response => SpecTemplatesCodec.decode(response.data)));
  }

  /**
   * 读取产品模板
   */
  getTemplate(organizationCode: string, type: string): Observable<ObjectWithLifecycle<DeviceTemplate>> {
    const params = {
      organizationCode: organizationCode,
      type: type
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v1/template`, {params})
      .pipe(map(response => DeviceTemplateWithLifecycleCodec.decode(response.data)));
  }

  // /**
  //  * 读取产品列表
  //  */
  // getProductsV1(organizationCode: string, pageNum: number, pageSize: number): Observable<JoyProductsV1> {
  //   const params = {
  //     organizationCode: organizationCode,
  //     pageNum: pageNum,
  //     pageSize: pageSize
  //   }
  //   return this.http
  //     .get<JoyResponse>(`${this.server}/v1/product/list`, {params})
  //     .pipe(map(response => JoyProductsV1Codec.decode(response.data)));
  // }
  //
  // /**
  //  * 读取产品信息
  //  */
  // getProductV1(organizationCode: string, productId: string): Observable<JoyProductV1> {
  //   const params = {
  //     organizationCode: organizationCode,
  //     productId: productId,
  //   }
  //   return this.http
  //     .get<JoyResponse>(`${this.server}/v1/product`, {params})
  //     .pipe(map(response => JoyProductV1Codec.decode(response.data)));
  // }

  /**------------------------------------------------------------------------------------------------
   * 产品（基本信息、配网引导、功能、控制页、固件、手册）
   *------------------------------------------------------------------------------------------------*/

  /**
   * 读取产品列表
   */
  getFullProducts(organizationCode: string, pageIndex: number, pageSize: number): Observable<JoyProducts> {
    const params = {
      organization: organizationCode,
      index: pageIndex,
      size: pageSize
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/full/all`, {params})
      .pipe(map(response => JoyProductsCodec.decode(response.data)));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品基本信息
   *------------------------------------------------------------------------------------------------*/

  /**
   * 读取产品列表
   */
  getProducts(organizationCode: string): Observable<ProductBasic[]> {
    console.log('getProducts: ', organizationCode);
    const params = {
      organization: organizationCode,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/basic/all`, {params})
      .pipe(map(response => ProductBasicCodec.decodeArray(response.data.products)));
  }

  /**
   * 创建产品基本信息
   */
  createProduct(product: ProductBasic): Observable<Number> {
    return this.http
      .post<JoyResponse>(`${this.server}/v2/product/basic/one`, ProductBasicCodec.encode(product))
      .pipe(map(response => response.data.id));
  }

  /**
   * 删除产品基本信息
   */
  deleteProduct(productId: number): Observable<void> {
    const params = {
      productId: productId,
    }
    return this.http
      .delete<JoyResponse>(`${this.server}/v2/product/basic/one`, {params})
      .pipe(map(() => undefined));
  }

  /**
   * 修改产品基本信息
   */
  updateProduct(product: ProductBasic, fields: Map<string, any>): Observable<void> {
    fields.set('organization', product.organization);
    fields.set('model', product.model);

    const body = Object.fromEntries(fields);

    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/basic/one`, body)
      .pipe(map(() => undefined));
  }

  /**
   * 读取产品基本信息
   */
  getProduct(productId: number): Observable<ProductBasic> {
    const params = {
      productId: productId,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/basic/one`, {params})
      .pipe(map(response => ProductBasicCodec.decode(response.data)));
  }

  /**
   * 申请上线（开发者），取消上线申请（开发者）， 批准上线（管理员，或QA）
   */
  setProductLifecycle(productId: number, lifecycle: LifeCycle): Observable<void> {
    const body = {
      productId: productId,
    }
    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/lifecycle/${lifecycle.toString()}`, body)
      .pipe(map(() => undefined));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品配网引导
   *------------------------------------------------------------------------------------------------*/

  /**
   * 修改产品配网引导
   */
  updateProductWizard(productId: number, wizard: ProductWizard): Observable<void> {
    const body = {
      productId: productId,
      wizard: ProductWizardCodec.encode(wizard)
    }

    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/wizard`, body)
      .pipe(map(() => undefined));
  }

  /**
   * 读取产品配网引导
   */
  getProductWizard(productId: number): Observable<ProductWizard> {
    const params = {
      productId: productId,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/wizard`, {params})
      .pipe(map(response => ProductWizardCodec.decode(response.data)));
  }

  /**
   * 申请上线（开发者），取消上线申请（开发者）， 批准上线（管理员，或QA）
   */
  setProductWizardLifecycle(productId: number, lifecycle: LifeCycle): Observable<void> {
    const body = {
      productId: productId,
    }
    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/wizard/lifecycle/${lifecycle.toString()}`, body)
      .pipe(map(() => undefined));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品功能
   *------------------------------------------------------------------------------------------------*/

  /**
   * 读取产品功能版本
   */
  getProductInstances(productId: number): Observable<ProductInstance[]> {
    const params = {
      productId: productId,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/instance/all`, {params})
      .pipe(map(response => ProductInstanceCodec.decodeArray(response.data.instances)));
  }

  /**
   * 创建产品功能版本
   */
  createProductInstance(productId: number, instance: DeviceInstance): Observable<void> {
    const body = {
      productId: productId,
      definition: DeviceInstanceCodec.encode(instance)
    };

    return this.http
      .post<JoyResponse>(`${this.server}/v2/product/instance/one`, body)
      .pipe(map(() => undefined));
  }

  /**
   * 删除产品功能版本
   */
  deleteProductInstance(type: string): Observable<void> {
    return this.http
      .delete<JoyResponse>(`${this.server}/v2/product/instance/one/${type}`)
      .pipe(map(() => undefined));
  }

  /**
   * 修改产品功能版本
   */
  updateProductInstance(instance: DeviceInstance): Observable<void> {
    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/instance/one`, DeviceInstanceCodec.encode(instance))
      .pipe(map(() => undefined));
  }

  /**
   * 读取产品功能版本
   */
  getProductInstance(type: string): Observable<ObjectWithLifecycle<DeviceInstance>> {
    const params = {
      type: type,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/instance/one`, {params})
      .pipe(map(response => DeviceInstanceWithLifecycleCodec.decode(response.data)));
  }

  /**
   * 申请上线（开发者），取消上线申请（开发者）， 批准上线（管理员，或QA）
   */
  setProductInstanceLifecycle(type: string, lifecycle: LifeCycle): Observable<void> {
    const body = {
      instance: type,
    }
    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/instance/lifecycle/${lifecycle.toString()}`, body)
      .pipe(map(() => undefined));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品控制页
   *------------------------------------------------------------------------------------------------*/

  /**
   * 创建产品控制页
   */
  createProductPanel(productId: number, panel: ProductPanel): Observable<void> {
    const body = {
      productId: productId,
      panel: ProductPanelCodec.encode(panel)
    };

    return this.http
      .post<JoyResponse>(`${this.server}/v2/product/panel/one`, body)
      .pipe(map(() => undefined));
  }

  /**
   * 删除产品控制页
   */
  deleteProductPanel(productId: number, category: string, versionCode: number): Observable<void> {
    const params = {
      productId: productId,
      category: category,
      versionCode: versionCode
    }
    return this.http
      .delete<JoyResponse>(`${this.server}/v2/product/panel/one/`, {params})
      .pipe(map(() => undefined));
  }

  /**
   * 读取产品控制页
   */
  getProductPanels(productId: number): Observable<ProductPanel[]> {
    const params = {
      productId: productId,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/panel/all`, {params})
      .pipe(map(response => ProductPanelCodec.decodeArray(response.data.panels)));
  }

  /**
   * 读取产品控制页(指定设备功能版本)
   */
  getProductPanelsByInstanceVersion(type: string): Observable<ProductPanel[]> {
    const params = {
      type: type,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/panel/all`, {params})
      .pipe(map(response => ProductPanelCodec.decodeArray(response.data.panels)));
  }

  /**
   * 申请上线（开发者），取消上线申请（开发者）， 批准上线（管理员，或QA）
   */
  setProductPanelLifecycle(productId: number, category: string, versionCode: number, lifecycle: LifeCycle): Observable<void> {
    const body = {
      productId: productId,
      category: category,
      version: {
        code: versionCode
      }
    }
    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/panel/lifecycle/${lifecycle.toString()}`, body)
      .pipe(map(() => undefined));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品固件
   *------------------------------------------------------------------------------------------------*/

  /**
   * 创建产品固件
   */
  createProductFirmware(productId: number, firmware: ProductFirmware): Observable<void> {
    const body = {
      productId: productId,
      firmware: ProductFirmwareCodec.encode(firmware),
    };

    return this.http
      .post<JoyResponse>(`${this.server}/v2/product/firmware/one`, body)
      .pipe(map(() => undefined));
  }

  /**
   * 删除产品固件
   */
  deleteProductFirmware(productId: number, firmwareName: string): Observable<void> {
    const params = {
      productId: productId,
      name: firmwareName
    }
    return this.http
      .delete<JoyResponse>(`${this.server}/v2/product/firmware/one/`, {params})
      .pipe(map(() => undefined));
  }

  /**
   * 修改产品固件
   */
  updateProductFirmware(productId: number, firmware: ProductFirmware): Observable<void> {
    const body = {
      productId: productId,
      firmware: ProductFirmwareCodec.encode(firmware),
    };

    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/firmware/one`, body)
      .pipe(map(() => undefined));
  }

  /**
   * 读取产品固件
   */
  getProductFirmwares(productId: number): Observable<ProductFirmware[]> {
    const params = {
      productId: productId,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/firmware/all`, {params})
      .pipe(map(response => ProductFirmwareCodec.decodeArray(response.data.firmwares)));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品固件实例
   *------------------------------------------------------------------------------------------------*/

  /**
   * 创建产品固件实例
   */
  createProductFirmwareInstance(productId: number, firmwareName: string, instance: ProductFirmwareInstance): Observable<ProductFirmwareInstance> {
    const body = {
      productId: productId,
      name: firmwareName,
      instance: ProductFirmwareInstanceCodec.encode(instance)
    };

    return this.http
      .post<JoyResponse>(`${this.server}/v2/product/firmware/instance/one`, body)
      .pipe(map(response => ProductFirmwareInstanceCodec.decode(response.data)));
  }

  /**
   * 删除产品固件实例
   */
  deleteProductFirmwareInstance(productId: number, firmwareName: string, versionCode: number): Observable<void> {
    const params = {
      productId: productId,
      name: firmwareName,
      versionCode: versionCode
    }
    return this.http
      .delete<JoyResponse>(`${this.server}/v2/product/firmware/instance/one`, {params})
      .pipe(map(() => undefined));
  }

  /**
   * 修改产品固件实例
   */
  updateProductFirmwareInstance(productId: number, firmwareName: string, instance: ProductFirmwareInstance): Observable<void> {
    const body = {
      productId: productId,
      name: firmwareName,
      instance: ProductFirmwareInstanceCodec.encode(instance)
    };

    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/firmware/instance/one`, body)
      .pipe(map(() => undefined));
  }

  /**
   * 读取产品固件实例
   */
  getProductFirmwareInstances(productId: number, firmwareName: string): Observable<ProductFirmwareInstance[]> {
    const params = {
      productId: productId,
      name: firmwareName,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/firmware/instance/all`, {params})
      .pipe(map(response => ProductFirmwareInstanceCodec.decodeArray(response.data[firmwareName])));
  }

  /**
   * 申请上线（开发者），取消上线申请（开发者）， 批准上线（管理员，或QA）
   */
  setProductFirmwareInstanceLifecycle(productId: number, firmwareName: string, code: number, lifecycle: LifeCycle): Observable<void> {
    const body = {
      productId: productId,
      name: firmwareName,
      version: {
        code: code
      }
    }
    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/firmware/instance/lifecycle/${lifecycle.toString()}`, body)
      .pipe(map(() => undefined));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品手册
   *------------------------------------------------------------------------------------------------*/

  /**
   * 修改产品手册
   */
  updateProductManual(productId: number, manual: ProductManual): Observable<void> {
    const body = {
      productId: productId,
      manual: ProductManualCodec.encode(manual)
    }

    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/manual`, body)
      .pipe(map(() => undefined));
  }

  /**
   * 读取产品配网引导
   */
  getProductManual(productId: number): Observable<ProductManual> {
    const params = {
      productId: productId,
    }
    return this.http
      .get<JoyResponse>(`${this.server}/v2/product/manual`, {params})
      .pipe(map(response => ProductManualCodec.decode(response.data)));
  }

  /**
   * 申请上线（开发者），取消上线申请（开发者）， 批准上线（管理员，或QA）
   */
  setProductManualLifecycle(productId: number, lifecycle: LifeCycle): Observable<void> {
    const body = {
      productId: productId,
    }
    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/manual/lifecycle/${lifecycle.toString()}`, body)
      .pipe(map(() => undefined));
  }

  /**
   * 申请上线（开发者），取消上线申请（开发者）， 批准上线（管理员，或QA）
   */
  setProductVisibilityLifecycle(productId: number, lifecycle: LifeCycle): Observable<void> {
    const body = {
      productId: productId,
    }
    return this.http
      .put<JoyResponse>(`${this.server}/v2/product/visibility/lifecycle/${lifecycle.toString()}`, body)
      .pipe(map(() => undefined));
  }

  /**------------------------------------------------------------------------------------------------
   * 文件上传
   *------------------------------------------------------------------------------------------------*/
  getFileUploadUrl(productId: number, type: string, filename: string): Observable<OSSUpload> {
    const params = {
      category: 'product',
      id: productId,
      fileType: type,
      fileName: filename
    };

      return this.http
      .get<JoyResponse>(`${this.server}/v2/file/upload/url`, {params})
      .pipe(map(response => OSSUploadCodec.decode(response.data)));
  }

  /**------------------------------------------------------------------------------------------------
   * 借助AI生成设备控制界面
   *------------------------------------------------------------------------------------------------*/

  /**
   * 设计文档
   */
  private getDesignDoc(): Promise<string> {
    return lastValueFrom(this.http.get('/DESIGN.md', {responseType: 'text'}));
  }

  /**
   * 设备文档
   */
  private getDeviceDoc(): Promise<string> {
    return lastValueFrom(this.http.get('/DEVICE.md', {responseType: 'text'}));
  }

  /**
   * 提示文档
   */
  private getPromptDoc(): Promise<string> {
    return lastValueFrom(this.http.get('/prompt/deepseek.md', {responseType: 'text'}));
  }

  /**
   * 设备实例定义
   * @param type
   */
  private getDeviceInstance(type: string): Promise<string> {
    const params = {
      type: type,
    };

    return lastValueFrom(
      this.http
        .get<JoyResponse>(`${this.server}/v2/product/instance/one`, { params })
        .pipe(map(response => response.data.definition))
    );
  }

  async createDeviceUI(productId: number, type: string): Promise<any> {
    const design = await this.getDesignDoc();
    const device = await this.getDeviceDoc();
    const prompt = await this.getPromptDoc();
    const instance = await this.getDeviceInstance(type);
    const body = {
      productId: productId,
      panel: {
        category: 'mobile',
        type: 'web',
        version: { name: 'xxx'},
        instance: type
      },
      prompt: {
        model: 'Chatrhino-750B',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: device
              },
              {
                type: 'text',
                text: JSON.stringify(instance)
              },
              {
                type: 'text',
                text: design
              },
              {
                type: 'text',
                text: prompt
              },
            ]
          }
        ],
        stream: false,
        chat_template_kwargs: {
          enable_thinking: true
        }
      }
    };

    console.log('body: ', JSON.stringify(body));

    // const deepseek = {
    //   model: 'deepseek-chat',
    //   messages: [
    //     {
    //       role: 'user',
    //       content: [
    //         {
    //           type: 'text',
    //           text: device
    //         },
    //         {
    //           type: 'text',
    //           text: JSON.stringify(instance)
    //         },
    //         {
    //           type: 'text',
    //           text: design
    //         },
    //         {
    //           type: 'text',
    //           text: prompt
    //         },
    //       ]
    //     }
    //   ],
    //   stream: false,
    //   thinking: {
    //     type: 'enabled'
    //   }
    // };
    //
    // console.log('body for deepseek: ', JSON.stringify(deepseek));

    return lastValueFrom(
      this.http
        .post<JoyResponse>(`${this.server}/v2/product/panel/one/ai`, body)
        .pipe(map(response => response.data))
    );
  }
}
