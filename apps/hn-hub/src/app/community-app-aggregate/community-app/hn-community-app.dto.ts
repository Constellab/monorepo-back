import { HnUserDto } from '../../users/hn-user.dto';
import { HnSpaceDto } from '../../space-aggregate/space/hn-space.dto';
import { HnCommunityApp } from './hn-community-app.entity';
import { TeRichText, TeRichTextDTO } from '@monorepo/te-text-editor';

export class HnCommunityAppDto {
  id: string;
  createdAt: string;
  lastModifiedAt: string;
  createdBy: HnUserDto;
  lastModifiedBy: HnUserDto;
  title: string;
  appUrl: string;
  description?: TeRichTextDTO;
  likes: number;
  comments: number;
  executions: number;
  picture?: string;
  space?: HnSpaceDto;

  constructor(app: HnCommunityApp) {
    if (!app) return;
    this.id = app.id;
    this.createdAt = app.createdAt.toISO();
    this.createdBy = new HnUserDto(app.createdBy);
    this.lastModifiedAt = app.lastModifiedAt.toISO();
    this.lastModifiedBy = new HnUserDto(app.lastModifiedBy);
    this.title = app.title;
    this.appUrl = app.appUrl;
    this.likes = app.likes;
    this.comments = app.comments;
    this.executions = app.executions;
    this.description = new TeRichText(app.description).toJson();
    this.picture = app.picture;
    this.space = app.space ? new HnSpaceDto(app.space) : null;
  }
}

export class HnCommunityAppEditDto {
  title: string;
  appUrl: string;
  picture?: string;
  description?: TeRichTextDTO;
  spaceId?: string;
  id?: string;
}
