import {JoyProduct} from './JoyProduct';
import {JoyPage} from './JoyPage';

export class JoyProducts {

  constructor(
    public page: JoyPage,
    public list: JoyProduct[]
  ) {
  }
}
