import { Expose } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';

import { HnInviteStatus } from '../../core/model/config/hn-invite-status.enum';
import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';
import { HnAgent } from '../agent/hn-agent.entity';

@Entity('agent_co_author_invite')
export class HnAgentCoAuthorInvite extends HnBaseEntity {
  @Column()
  email: string;

  @Column('enum', { enum: HnInviteStatus, default: HnInviteStatus.PENDING })
  status: HnInviteStatus = HnInviteStatus.PENDING;

  @ManyToOne((type) => HnAgent, { eager: true })
  agent: HnAgent;

  @Expose()
  @Column('uuid')
  token: string;
}
