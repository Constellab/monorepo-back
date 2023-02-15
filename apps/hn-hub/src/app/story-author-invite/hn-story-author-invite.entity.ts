import {Column, Entity, ManyToOne} from 'typeorm';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {Expose} from 'class-transformer';
import {HnStory} from '../story/hn-story.entity';

export enum HnStoryAuthorInviteStatus {
  ACCEPTED = 'ACCEPTED',
  PENDING = 'PENDING'
}

@Entity('StoryAuthorInvite')
export class HnStoryAuthorInvite extends HnBaseEntity {

  @Column()
  email: string;

  @Column('enum', {enum: HnStoryAuthorInviteStatus, default: HnStoryAuthorInviteStatus.PENDING})
  status: HnStoryAuthorInviteStatus = HnStoryAuthorInviteStatus.PENDING;

  @ManyToOne(type => HnStory, {eager: true})
  story: HnStory;

  @Expose()
  @Column('uuid')
  token: string;

}
