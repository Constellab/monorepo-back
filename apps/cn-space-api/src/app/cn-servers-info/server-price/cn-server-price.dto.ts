import { ClLuxonDateTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';

import { CnServerPrice } from './cn-server-price.entity';

export class CnServerPrices {
  constructor(public prices: CnServerPrice[]) {}

  public getPriceAt(date: DateTime): number {
    const price = this.prices.find((p) => p.startDate <= date && (p.endDate === null || p.endDate >= date));

    if (!price) {
      return 0;
      // throw new Error('Could not find the price for the given date.');
    }

    return price.price;
  }
}

export class CnCreateServerPriceDTO {
  price: number;

  @ClLuxonDateTransform()
  startDate: DateTime;
}
