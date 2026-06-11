import {JoyPage} from '../../define/product/JoyPage';

export class JoyPageCodec {
  static decode(x: any): JoyPage {
    const index: number = x.index || 0;
    const size: number = x.size || 0;
    const total: number = x.total || 0;
    return new JoyPage(index, size, total);
  }
}
