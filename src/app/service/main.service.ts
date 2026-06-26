import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {lastValueFrom, map, Observable} from "rxjs";
import {OxResponse} from "./response/OxResponse";
import {
  DeviceInstance,
  DeviceInstanceCodec,
  DeviceTemplate,
  DeviceTemplateCodec,
  LifeCycle,
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
  Oauth2Configuration,
  Oauth2ConfigurationCodec,
  NamespaceDefinition,
  NamespaceDefinitionCodec, DeviceDefinition, DeviceDefinitionCodec, DeviceType, ServiceDefinition,
  ServiceDefinitionCodec, ActionDefinition, ActionDefinitionCodec, EventDefinition, EventDefinitionCodec,
  PropertyDefinition, PropertyDefinitionCodec, FormatDefinition, FormatDefinitionCodec, UnitDefinition,
  UnitDefinitionCodec, ActionType, ServiceType, EventType, FormatType, PropertyType, UnitType, TemplateSummary,
  TemplateSummaryCodec
} from '@openxiot/xiot-core-spec-ts';
import {OSSUpload} from '../typedef/define/upload/OSSUpload';
import {OSSUploadCodec} from '../typedef/codec/upload/OSSUploadCodec';
import {Organization, OrganizationMember} from '../typedef/define/developer/Organization';
import {OrganizationCodec, OrganizationMemberCodec} from '../typedef/codec/developer/OrganizationCodec';
import {Statistic} from '../typedef/define/statistic/Statistic';
import {StatisticCodec} from '../typedef/codec/statistic/StatisticCodec';

@Injectable({providedIn: 'root'})
export class MainService {
  private server: string = environment.server;
  private account: string = environment.account;
  private storage: string = environment.storage;

  constructor(
    private http: HttpClient
  ) {
  }

  getDeveloperPlatforms(): Observable<Oauth2Configuration[]> {
    return this.http
      .get<OxResponse>(`${this.account}/developer/platform/all`)
      .pipe(map(response => Oauth2ConfigurationCodec.decodeArray(response.data)));
  }

  /**------------------------------------------------------------------------------------------------
   * 统计数据
   *------------------------------------------------------------------------------------------------*/
  getStatistic(): Observable<Statistic> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/statistic`)
      .pipe(map(response => StatisticCodec.decode(response.data)));
  }

  /**------------------------------------------------------------------------------------------------
   * 动态判断：如果有开发组，就访问开发组可见数据；如果没有，就只访问公开的信息
   *------------------------------------------------------------------------------------------------*/
  getAllNamespaces(organization: Organization | undefined): Observable<NamespaceDefinition[]> {
    if (!organization) {
      return this.getPublicNamespaces();
    } else {
      return this.getVisibleNamespaces(organization.id);
    }
  }

  getAllProducts(organization: Organization | undefined): Observable<ProductBasic[]> {
    if (!organization) {
      return this.getPublicProducts();
    } else {
      return this.getVisibleProducts(organization.id);
    }
  }

  /**------------------------------------------------------------------------------------------------
   * 开发组
   *------------------------------------------------------------------------------------------------*/
  createOrganization(organizationId: string, name: string): Observable<void> {
    console.log(`addOrganization: ${organizationId}/${name}`);
    return this.http
      .post(`${this.account}/organization/one/${organizationId}`, {name})
      .pipe(map(() => undefined));
  }

  removeOrganization(organizationId: string): Observable<void> {
    console.log(`removeOrganization: ${organizationId}`);
    return this.http
      .delete(`${this.account}/organization/one/${organizationId}`)
      .pipe(map(() => undefined));
  }

  updateOrganizationName(organizationId: string, name: string): Observable<void> {
    console.log(`updateOrganizationName: ${organizationId} => ${name}`);
    return this.http
      .put(`${this.account}/organization/one/${organizationId}`, {name: name})
      .pipe(map(() => undefined));
  }

  addOrganizationMember(organizationId: string, member: OrganizationMember) {
    console.log(`addOrganizationMember: ${organizationId} => ${member}`);
    return this.http
      .post(`${this.account}/organization/member/${organizationId}`, OrganizationMemberCodec.encode(member))
      .pipe(map(() => undefined));
  }

  getOrganization(organizationId: string): Observable<Organization> {
    console.log(`getOrganization: ${organizationId}`);
    return this.http
      .get<OxResponse>(`${this.account}/organization/one/${organizationId}`)
      .pipe(map(response => OrganizationCodec.decode(response.data)));
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http
      .get<OxResponse>(`${this.account}/organization/many`)
      .pipe(map(response => OrganizationCodec.decodeArray(response.data)));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品规范
   *------------------------------------------------------------------------------------------------*/
  createNamespace(namespace: NamespaceDefinition): Observable<void> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/spec/namespace/one`, NamespaceDefinitionCodec.encode(namespace))
      .pipe(map(() => undefined));
  }

  deleteNamespace(namespace: string): Observable<void> {
    const params = {
      namespace: namespace,
    }
    return this.http
      .delete<OxResponse>(`${this.server}/v1/spec/namespace/one`, {params})
      .pipe(map(() => undefined));
  }

  updateSpecNamespace(namespace: NamespaceDefinition): Observable<void> {
    return this.http
      .put<OxResponse>(`${this.server}/v1/spec/namespace/one`, NamespaceDefinitionCodec.encode(namespace))
      .pipe(map(() => undefined));
  }

  getSpecNamespace(namespace: string): Observable<NamespaceDefinition> {
    const params = {
      namespace: namespace,
    }
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/namespace/one`, {params})
      .pipe(map(response => NamespaceDefinitionCodec.decode(response.data)));
  }

  private getVisibleNamespaces(organization: string): Observable<NamespaceDefinition[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/namespace/visible/${organization}`)
      .pipe(map(response => NamespaceDefinitionCodec.decodeArray(response.data)));
  }

  private getPublicNamespaces(): Observable<NamespaceDefinition[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/namespace/public`)
      .pipe(map(response => NamespaceDefinitionCodec.decodeArray(response.data)));
  }

  getSpecNamespaces(): Observable<NamespaceDefinition[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/namespace/all`)
      .pipe(map(response => NamespaceDefinitionCodec.decodeArray(response.data)));
  }

  // device

  createDeviceDefinition(def: DeviceDefinition): Observable<void> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/spec/device/one`, DeviceDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  deleteDeviceDefinition(type: DeviceType): Observable<void> {
    return this.http
      .delete<OxResponse>(`${this.server}/v1/spec/device/one/${type.toString()}`)
      .pipe(map(() => undefined));
  }

  updateDeviceDefinition(def: DeviceDefinition): Observable<void> {
    return this.http
      .put<OxResponse>(`${this.server}/v1/spec/device/one`, DeviceDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  getDeviceDefinition(type: string): Observable<DeviceDefinition> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/device/one/${type}`)
      .pipe(map(response => DeviceDefinitionCodec.decode(response.data)));
  }

  getDeviceDefinitions(ns: string): Observable<DeviceDefinition[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/device/many/${ns}`)
      .pipe(map(response => DeviceDefinitionCodec.decodeArray(response.data)));
  }

  // service

  createServiceDefinition(def: ServiceDefinition): Observable<void> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/spec/service/one`, ServiceDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  deleteServiceDefinition(type: ServiceType): Observable<void> {
    return this.http
      .delete<OxResponse>(`${this.server}/v1/spec/service/one/${type.toString()}`)
      .pipe(map(() => undefined));
  }

  updateServiceDefinition(def: ServiceDefinition): Observable<void> {
    return this.http
      .put<OxResponse>(`${this.server}/v1/spec/service/one`, ServiceDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  getServiceDefinition(type: string): Observable<ServiceDefinition> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/service/one/${type}`)
      .pipe(map(response => ServiceDefinitionCodec.decode(response.data)));
  }

  getServiceDefinitions(ns: string): Observable<ServiceDefinition[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/service/many/${ns}`)
      .pipe(map(response => ServiceDefinitionCodec.decodeArray(response.data)));
  }

  // action

  createActionDefinition(def: ActionDefinition): Observable<void> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/spec/action/one`, ActionDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  deleteActionDefinition(type: ActionType): Observable<void> {
    return this.http
      .delete<OxResponse>(`${this.server}/v1/spec/action/one/${type.toString()}`)
      .pipe(map(() => undefined));
  }

  updateActionDefinition(def: ActionDefinition): Observable<void> {
    return this.http
      .put<OxResponse>(`${this.server}/v1/spec/action/one`, ActionDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  getActionDefinition(type: string): Observable<ActionDefinition> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/action/one/${type}`)
      .pipe(map(response => ActionDefinitionCodec.decode(response.data)));
  }

  getActionDefinitions(ns: string): Observable<ActionDefinition[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/action/many/${ns}`)
      .pipe(map(response => ActionDefinitionCodec.decodeArray(response.data)));
  }

  // event

  createEventDefinition(def: EventDefinition): Observable<void> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/spec/event/one`, EventDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  deleteEventDefinition(type: EventType): Observable<void> {
    return this.http
      .delete<OxResponse>(`${this.server}/v1/spec/event/one/${type.toString()}`)
      .pipe(map(() => undefined));
  }

  updateEventDefinition(def: EventDefinition): Observable<void> {
    return this.http
      .put<OxResponse>(`${this.server}/v1/spec/event/one`, EventDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  getEventDefinition(type: string): Observable<EventDefinition> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/event/one/${type}`)
      .pipe(map(response => EventDefinitionCodec.decode(response.data)));
  }

  getEventDefinitions(ns: string): Observable<EventDefinition[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/event/many/${ns}`)
      .pipe(map(response => EventDefinitionCodec.decodeArray(response.data)));
  }

  // property
  createPropertyDefinition(def: PropertyDefinition): Observable<void> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/spec/property/one`, PropertyDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  deletePropertyDefinition(type: PropertyType): Observable<void> {
    return this.http
      .delete<OxResponse>(`${this.server}/v1/spec/property/one/${type.toString()}`)
      .pipe(map(() => undefined));
  }

  updatePropertyDefinition(def: PropertyDefinition): Observable<void> {
    return this.http
      .put<OxResponse>(`${this.server}/v1/spec/property/one`, PropertyDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  getPropertyDefinition(type: string): Observable<PropertyDefinition> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/property/one/${type}`)
      .pipe(map(response => PropertyDefinitionCodec.decode(response.data)));
  }

  getPropertyDefinitions(ns: string): Observable<PropertyDefinition[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/property/many/${ns}`)
      .pipe(map(response => PropertyDefinitionCodec.decodeArray(response.data)));
  }

  // format
  createFormatDefinition(def: FormatDefinition): Observable<void> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/spec/format/one`, FormatDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  createFormatDefinitions(defs: FormatDefinition[]): Observable<void> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/spec/format/many`, FormatDefinitionCodec.encodeArray(defs))
      .pipe(map(() => undefined));
  }

  deleteFormatDefinition(type: FormatType): Observable<void> {
    return this.http
      .delete<OxResponse>(`${this.server}/v1/spec/format/one/${type.toString()}`)
      .pipe(map(() => undefined));
  }

  updateFormatDefinition(def: FormatDefinition): Observable<void> {
    return this.http
      .put<OxResponse>(`${this.server}/v1/spec/format/one`, FormatDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  getFormatDefinition(type: string): Observable<FormatDefinition> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/format/one/${type}`)
      .pipe(map(response => FormatDefinitionCodec.decode(response.data)));
  }

  getFormatDefinitions(ns: string): Observable<FormatDefinition[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/format/many/${ns}`)
      .pipe(map(response => FormatDefinitionCodec.decodeArray(response.data)));
  }

  // unit
  createUnitDefinition(def: UnitDefinition): Observable<void> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/spec/unit/one`, UnitDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  deleteUnitDefinition(type: UnitType): Observable<void> {
    return this.http
      .delete<OxResponse>(`${this.server}/v1/spec/unit/one/${type.toString()}`)
      .pipe(map(() => undefined));
  }

  updateUnitDefinition(def: UnitDefinition): Observable<void> {
    return this.http
      .put<OxResponse>(`${this.server}/v1/spec/unit/one`, UnitDefinitionCodec.encode(def))
      .pipe(map(() => undefined));
  }

  getUnitDefinition(type: string): Observable<UnitDefinition> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/format/one/${type}`)
      .pipe(map(response => UnitDefinitionCodec.decode(response.data)));
  }

  getUnitDefinitions(ns: string): Observable<UnitDefinition[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/spec/unit/many/${ns}`)
      .pipe(map(response => UnitDefinitionCodec.decodeArray(response.data)));
  }

  /**------------------------------------------------------------------------------------------------
   * 产品模板
   *------------------------------------------------------------------------------------------------*/

  createTemplate(template: DeviceTemplate): Observable<void> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/template/one`, DeviceTemplateCodec.encode(template))
      .pipe(map(() => undefined));
  }

  removeTemplate(type: string): Observable<void> {
    return this.http
      .delete<OxResponse>(`${this.server}/v1/template/one/${type}`)
      .pipe(map(() => undefined));
  }

  updateTemplate(template: DeviceTemplate): Observable<void> {
    return this.http
      .put<OxResponse>(`${this.server}/v1/template/one`, DeviceTemplateCodec.encode(template))
      .pipe(map(() => undefined));
  }

  /**
   * 读取产品模板列表
   */
  getTemplates(ns: string): Observable<TemplateSummary[]> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/template/many/${ns}`)
      .pipe(map(response => TemplateSummaryCodec.decodeArray(response.data)));
  }

  /**
   * 读取产品模板
   */
  getTemplate(type: string): Observable<DeviceTemplate> {
    return this.http
      .get<OxResponse>(`${this.server}/v1/template/one/${type}`)
      .pipe(map(response => DeviceTemplateCodec.decode(response.data)));
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

  // /**
  //  * 读取产品列表
  //  */
  // getFullProducts(organizationCode: string, pageIndex: number, pageSize: number): Observable<JoyProducts> {
  //   const params = {
  //     organization: organizationCode,
  //     index: pageIndex,
  //     size: pageSize
  //   }
  //   return this.http
  //     .get<OxResponse>(`${this.server}/v1/product/full/all`, {params})
  //     .pipe(map(response => JoyProductsCodec.decode(response.data)));
  // }

  /**------------------------------------------------------------------------------------------------
   * 产品基本信息
   *------------------------------------------------------------------------------------------------*/

  /**
   * 读取公开产品列表
   */
  getPublicProducts(): Observable<ProductBasic[]> {
    console.log('getPublicProducts');
    return this.http
      .get<OxResponse>(`${this.server}/v1/product/basic/public`)
      .pipe(map(response => ProductBasicCodec.decodeArray(response.data.products)));
  }

  /**
   * 读取组织可见的产品列表
   */
  getVisibleProducts(organization: string): Observable<ProductBasic[]> {
    console.log('getVisibleProducts: ', organization);
    return this.http
      .get<OxResponse>(`${this.server}/v1/product/basic/visible/${organization}`)
      .pipe(map(response => ProductBasicCodec.decodeArray(response.data.products)));
  }

  /**
   * 创建产品基本信息
   */
  createProduct(product: ProductBasic): Observable<Number> {
    return this.http
      .post<OxResponse>(`${this.server}/v1/product/basic/one`, ProductBasicCodec.encode(product))
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
      .delete<OxResponse>(`${this.server}/v1/product/basic/one`, {params})
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
      .put<OxResponse>(`${this.server}/v1/product/basic/one`, body)
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
      .get<OxResponse>(`${this.server}/v1/product/basic/one`, {params})
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
      .put<OxResponse>(`${this.server}/v1/product/lifecycle/${lifecycle.toString()}`, body)
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
      .put<OxResponse>(`${this.server}/v1/product/wizard`, body)
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
      .get<OxResponse>(`${this.server}/v1/product/wizard`, {params})
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
      .put<OxResponse>(`${this.server}/v1/product/wizard/lifecycle/${lifecycle.toString()}`, body)
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
      .get<OxResponse>(`${this.server}/v1/product/instance/all`, {params})
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
      .post<OxResponse>(`${this.server}/v1/product/instance/one`, body)
      .pipe(map(() => undefined));
  }

  /**
   * 删除产品功能版本
   */
  deleteProductInstance(type: string): Observable<void> {
    return this.http
      .delete<OxResponse>(`${this.server}/v1/product/instance/one/${type}`)
      .pipe(map(() => undefined));
  }

  /**
   * 修改产品功能版本
   */
  updateProductInstance(instance: DeviceInstance): Observable<void> {
    return this.http
      .put<OxResponse>(`${this.server}/v1/product/instance/one`, DeviceInstanceCodec.encode(instance))
      .pipe(map(() => undefined));
  }

  /**
   * 读取产品功能版本
   */
  getProductInstance(type: string): Observable<DeviceInstance> {
    const params = {
      type: type,
    }
    return this.http
      .get<OxResponse>(`${this.server}/v1/product/instance/one`, {params})
      .pipe(map(response => DeviceInstanceCodec.decode(response.data)));
  }

  /**
   * 申请上线（开发者），取消上线申请（开发者）， 批准上线（管理员，或QA）
   */
  setProductInstanceLifecycle(type: string, lifecycle: LifeCycle): Observable<void> {
    const body = {
      instance: type,
    }
    return this.http
      .put<OxResponse>(`${this.server}/v1/product/instance/lifecycle/${lifecycle.toString()}`, body)
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
      .post<OxResponse>(`${this.server}/v1/product/panel/one`, body)
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
      .delete<OxResponse>(`${this.server}/v1/product/panel/one/`, {params})
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
      .get<OxResponse>(`${this.server}/v1/product/panel/all`, {params})
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
      .get<OxResponse>(`${this.server}/v1/product/panel/all`, {params})
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
      .put<OxResponse>(`${this.server}/v1/product/panel/lifecycle/${lifecycle.toString()}`, body)
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
      .post<OxResponse>(`${this.server}/v1/product/firmware/one`, body)
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
      .delete<OxResponse>(`${this.server}/v1/product/firmware/one/`, {params})
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
      .put<OxResponse>(`${this.server}/v1/product/firmware/one`, body)
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
      .get<OxResponse>(`${this.server}/v1/product/firmware/all`, {params})
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
      .post<OxResponse>(`${this.server}/v1/product/firmware/instance/one`, body)
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
      .delete<OxResponse>(`${this.server}/v1/product/firmware/instance/one`, {params})
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
      .put<OxResponse>(`${this.server}/v1/product/firmware/instance/one`, body)
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
      .get<OxResponse>(`${this.server}/v1/product/firmware/instance/all`, {params})
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
      .put<OxResponse>(`${this.server}/v1/product/firmware/instance/lifecycle/${lifecycle.toString()}`, body)
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
      .put<OxResponse>(`${this.server}/v1/product/manual`, body)
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
      .get<OxResponse>(`${this.server}/v1/product/manual`, {params})
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
      .put<OxResponse>(`${this.server}/v1/product/manual/lifecycle/${lifecycle.toString()}`, body)
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
      .put<OxResponse>(`${this.server}/v1/product/visibility/lifecycle/${lifecycle.toString()}`, body)
      .pipe(map(() => undefined));
  }

  /**------------------------------------------------------------------------------------------------
   * 文件上传
   *------------------------------------------------------------------------------------------------*/
  getFileUploadUrl(organizationId: string, classify: string, type: string, filename: string): Observable<OSSUpload> {
    const params = {
      organizationId: organizationId,
      classify: classify,
      type: type,
      filename: filename
    };

    return this.http
      .get<OxResponse>(`${this.storage}/storage/upload/url`, {params})
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
        .get<OxResponse>(`${this.server}/v1/product/instance/one`, {params})
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
        version: {name: 'xxx'},
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
        .post<OxResponse>(`${this.server}/v1/product/panel/one/ai`, body)
        .pipe(map(response => response.data))
    );
  }
}
