import {ProductCodec} from '@openxiot/xiot-core-spec-ts';
import {JoyProductsV1} from '../../define/product/JoyProductsV1';

export class JoyProductsV1Codec {

  static decode(x: any): JoyProductsV1 {
    const products = new JoyProductsV1();
    products.total = x.total;
    products.products = ProductCodec.decodeArray(x.datalist);
    return products;
  }
}
