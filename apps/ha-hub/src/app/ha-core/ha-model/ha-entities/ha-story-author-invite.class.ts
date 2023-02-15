import {HaStory} from './ha-story.class';
import {Type} from 'class-transformer';
import {HaUser} from './ha-user';

export enum HaStoryAuthorInviteStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING'
}

export class HaStoryAuthorInvite{
  id: number;

  email: string;

  status: HaStoryAuthorInviteStatus;

  @Type(() => HaStory)
  story: HaStory;

  @Type(() => HaUser)
  createdBy: HaUser;

  token: string;
}
