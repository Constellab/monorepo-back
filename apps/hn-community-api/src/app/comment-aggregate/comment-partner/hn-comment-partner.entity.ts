import { Type } from 'class-transformer';
import { Entity, ManyToOne } from 'typeorm';

import { HnPartner } from '../../partner/hn-partner.entity';
import { HnCommentEntity } from '../comment-core/hn-comment.entity';

@Entity('comment_partner')
export class HnCommentPartner extends HnCommentEntity<HnPartner> {
  @Type(() => HnPartner)
  @ManyToOne(() => HnPartner, { onDelete: 'CASCADE', nullable: false })
  entity: HnPartner;
}
