import { HnUserDto } from '../../users/hn-user.dto';
import { HnCommunityAppCoAuthor } from './hn-community-app-co-author.entity';

export class HnCommunityAppCoAuthorDto {
  id: string;
  user: HnUserDto;

  constructor(communityAppCoAuthor: HnCommunityAppCoAuthor) {
    this.id = communityAppCoAuthor.id;
    this.user = new HnUserDto(communityAppCoAuthor.user);
  }
}
