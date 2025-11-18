import { Entity, ManyToOne } from 'typeorm';

import { HnPartner } from '../../partner/hn-partner.entity';
import { HnAbstractFileEntity } from '../file-core/hn-abstract-file.entity';

@Entity('file_partner')
export class HnFilePartner extends HnAbstractFileEntity<HnPartner> {
  @ManyToOne(() => HnPartner, { nullable: false, onDelete: 'CASCADE' })
  entity: HnPartner;
}
