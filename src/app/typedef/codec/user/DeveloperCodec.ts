import {Developer} from '../../define/user/Developer';

export class DeveloperCodec {

  static decode(x: any): Developer {
    if (x) {
      const name: string = x.name || '';
      const icon: string = x.icon || '';
      return new Developer(name, icon);
    } else {
      return new Developer('', '');
    }
  }
}
