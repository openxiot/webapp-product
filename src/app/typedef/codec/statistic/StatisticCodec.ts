import {Statistic} from '../../define/statistic/Statistic';

export class StatisticCodec {
  static decode(o: any): Statistic {
    const x = new Statistic();
    x.products = o.products || 0;
    x.templates = o.templates || 0;
    x.specifications = o.specifications || 0;
    return x;
  }
}
