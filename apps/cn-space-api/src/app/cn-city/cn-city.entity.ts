import { Column, Entity, ManyToOne } from 'typeorm';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { CnCountry } from '../cn-country/cn-country.entity';

@Entity('city')
export class CnCity extends BlEntityWithId {
  @Column()
  name: string;

  @ManyToOne(() => CnCountry, { nullable: false, onDelete: 'CASCADE', eager: true })
  country: CnCountry;
}
