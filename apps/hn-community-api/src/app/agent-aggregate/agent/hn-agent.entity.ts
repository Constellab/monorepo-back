import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { TeRichText, TeRichTextDTO } from '@monorepo/te-text-editor';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { HnTypingStyle } from '../../brick-aggregate/brick/hn-brick.dto';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnFileAgent } from '../../file-aggregate/file-agent/hn-file-agent.entity';
import { HnSpace } from '../../space-aggregate/space/hn-space.entity';
import { HnUser } from '../../users/hn-user.entity';
import { HnAgentCoAuthor } from '../agent-co-author/hn-agent-co-author.entity';
import { HnCreateAgentDto } from './hn-agent.dto';

@Entity('agent')
export class HnAgent extends BlEntityWithId {
  @Column()
  title!: string;

  @Column({ type: 'simple-json', nullable: true })
  description!: TeRichTextDTO | null;

  @Column({ nullable: true, type: 'int' })
  latestPublishVersion!: number | null;

  @ManyToOne(() => HnSpace, { eager: true, onUpdate: 'CASCADE', onDelete: 'CASCADE', nullable: true })
  space!: HnSpace | null;

  @BlLuxonDateTimeColumn({ nullable: true, update: false })
  createdAt!: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  createdBy!: HnUser | null;

  @BlLuxonDateTimeColumn({ nullable: true })
  lastModifiedAt!: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, { eager: true, nullable: true })
  lastModifiedBy!: HnUser | null;

  @Column({ nullable: true, type: 'varchar' })
  parentAgentVersionId!: string | null;

  @Column({ default: 0 })
  likes!: number;

  @Column({ default: 0 })
  comments!: number;

  @OneToMany(() => HnAgentCoAuthor, (agentCoAuthor) => agentCoAuthor.agent, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  agentCoAuthors!: HnAgentCoAuthor[];

  @OneToMany(() => HnFileAgent, (agentFile) => agentFile.entity, { nullable: true })
  agentFiles!: HnFileAgent[];

  @Column({ type: 'simple-json', nullable: true })
  latestStyle!: HnTypingStyle | null;

  static init(agentDto: HnCreateAgentDto, parentAgentVersionId?: string, user?: HnUser): HnAgent {
    const agent = new HnAgent();
    agent.title = agentDto.title;
    agent.space = agentDto.space ?? null;
    agent.parentAgentVersionId = parentAgentVersionId ?? null;
    agent.createdBy = user ?? null;
    agent.lastModifiedBy = user ?? null;
    agent.latestStyle = agentDto.versionFile.style ?? null;
    return agent;
  }

  @BeforeInsert()
  setCreatedByUser(): void {
    if (this.createdBy == null) {
      this.createdBy = HnCurrentUserHelper.getCurrentUser() ?? null;
      this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser() ?? null;
    }
    this.createdAt = ClDateHelper.getDate();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser() ?? null;
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  getDescriptionRichText(): TeRichText {
    return new TeRichText(this.description);
  }

  setDescriptionRichText(description: TeRichText): void {
    this.description = description.toJson();
  }
}
