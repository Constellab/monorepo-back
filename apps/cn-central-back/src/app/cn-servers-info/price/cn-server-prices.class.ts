import {CnServerInfoPrice} from './cn-server-info-price.entity';
import {DateTime} from 'luxon';

export class CnServerPrices {

  constructor(private prices: CnServerInfoPrice[]) {
  }

  public getPriceAt(date: DateTime): number {
    const price = this.prices.find(
      p => p.startDate <= date && (p.endDate === null || p.endDate >= date)
    );

    if (!price) {
      return 0;
      // throw new Error('Could not find the price for the given date.');
    }

    return price.price;
  }


}
