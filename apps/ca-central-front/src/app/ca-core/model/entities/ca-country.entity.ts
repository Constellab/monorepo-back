import {CaCity} from './ca-city.entity';
import {Type} from 'class-transformer';

export class CaCountry{
  id: string;

  name: string;

  shortName: string;

  @Type(() => CaCity)
  cities: CaCity[];
}
