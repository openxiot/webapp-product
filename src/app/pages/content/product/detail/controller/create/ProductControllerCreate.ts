import {ProductController, ProductControllerWeb, ProductInstance, Urn} from '@openxiot/xiot-core-spec-ts';

// 打开创建弹窗时传入的数据
export class ProductControllerCreateInput {
  constructor(
    public productInstances: ProductInstance[] = [],
    public controllers: ProductController[] = [],
  ) {
  }
}

// 创建弹窗确认后返回的数据
export class ProductControllerCreateData {
  constructor(
    public instance: Urn,
    public category: string,
    public versionName: string,
    public versionCode: number,
    public web: ProductControllerWeb | null,
  ) {
  }
}