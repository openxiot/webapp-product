import {JoyProducts} from '../../define/product/JoyProducts';
import {JoyProductCodec} from './JoyProductCodec';
import {JoyPageCodec} from './JoyPageCodec';

export class JoyProductsCodec {
  static decode(x: any): JoyProducts {
    const page = JoyPageCodec.decode(x.page);
    const list = JoyProductCodec.decodeArray(x.products);
    return new JoyProducts(page, list);
  }
}
