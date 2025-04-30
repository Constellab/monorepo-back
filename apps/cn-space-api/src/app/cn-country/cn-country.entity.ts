import { Column, Entity, OneToMany } from 'typeorm';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { CnCity } from '../cn-city/cn-city.entity';

@Entity('country')
export class CnCountry extends BlEntityWithId {
  @Column()
  name: string;

  @Column()
  shortName: string;

  @OneToMany(() => CnCity, (city: CnCity) => city.country)
  cities: CnCity[];
}
