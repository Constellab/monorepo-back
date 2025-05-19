import { HnUserDto } from '../../users/hn-user.dto';
import { HnTagCoAuthor } from './hn-tag-co-author.entity';

export class HnTagCoAuthorDto {
  id: string;
  user: HnUserDto;

  constructor(tagCoAuthor: HnTagCoAuthor) {
    this.id = tagCoAuthor.id;
    this.user = new HnUserDto(tagCoAuthor.user);
  }
}
