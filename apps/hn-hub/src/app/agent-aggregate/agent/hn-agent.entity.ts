import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { HnCreateAgentDto } from './hn-agent.dto';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { HnUser } from '../../users/hn-user.entity';
import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { Type } from 'class-transformer';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';
import { HnAgentCoAuthor } from '../agent-co-author/hn-agent-co-author.entity';
import { HnFileAgent } from '../../file-aggregate/file-agent/hn-file-agent.entity';
import { HnTypingStyle } from '../../brick-aggregate/brick/hn-brick.dto';

@Entity('agent')
export class HnAgent extends BlEntityWithId {
  @Column()
  title: string;

  @Column({ name: 'description', type: 'simple-json', nullable: true })
  description?: Record<string, any>;

  @Column({ name: 'latest_publish_version', nullable: true })
  latestPublishVersion?: number;

  @ManyToOne(() => HnSpace, { eager: true })
  space?: HnSpace;

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  createdBy?: HnUser;

  @BlLuxonDateTimeColumn({ nullable: true })
  lastModifiedAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  lastModifiedBy: HnUser;

  @Column({ nullable: true })
  parentAgentVersionId?: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  comments: number;

  @OneToMany(() => HnAgentCoAuthor, (agentCoAuthor) => agentCoAuthor.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  agentCoAuthors: HnAgentCoAuthor[];

  @OneToMany(() => HnFileAgent, (agentFile) => agentFile.entity, { nullable: true })
  agentFiles: HnFileAgent[];

  @Column({ name: 'latest_style', type: 'simple-json', nullable: true })
  latestStyle?: HnTypingStyle;

  static init(agentDto: HnCreateAgentDto, parentAgentVersionId?: string, user?: HnUser): HnAgent {
    const agent = new HnAgent();
    agent.title = agentDto.title;
    agent.space = agentDto.space;
    agent.parentAgentVersionId = parentAgentVersionId;
    agent.createdBy = user;
    agent.lastModifiedBy = user;
    agent.latestStyle = agentDto.versionFile.style;
    return agent;
  }

  @BeforeInsert()
  setCreatedByUser(): void {
    if (this.createdBy == null) {
      this.createdBy = HnCurrentUserHelper.getCurrentUser();
      this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser();
    }
    this.createdAt = ClDateHelper.getDate();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}
