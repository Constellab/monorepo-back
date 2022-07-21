import {CaCountry} from './ca-country.entity';

export class CaCity {
  id: string;

  name: string;

  countryId: string;

  country?: CaCountry;
}
