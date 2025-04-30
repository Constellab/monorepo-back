import { HnUserDto } from '../../users/hn-user.dto';
import { HnCommunityAppStat } from './hn-community-app-stat.entity';

export class HnCommunityAppStatDto {
  id: string;
  appUrl: string;
  executionDate: string;
  creator: HnUserDto;

  constructor(appStat: HnCommunityAppStat) {
    if (!appStat) return;
    this.id = appStat.id;
    this.appUrl = appStat.appUrl;
    this.executionDate = appStat.executionDate.toISO();
    this.creator = new HnUserDto(appStat.creator);
  }
}

export class HnCommunityAppStatLabDto {
  app_url: string;
}
