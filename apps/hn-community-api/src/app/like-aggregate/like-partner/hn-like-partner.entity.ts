import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { HnPartner } from '../../partner/hn-partner.entity';
import { HnAbstractLikeEntity } from '../like-core/hn-abstract-like.entity';

@Entity('like_partner')
export class HnLikePartner extends HnAbstractLikeEntity<HnPartner> {
  @Type(() => HnPartner)
  @ManyToOne(() => HnPartner, { eager: true, onDelete: 'CASCADE' })
  entity: HnPartner;
}
