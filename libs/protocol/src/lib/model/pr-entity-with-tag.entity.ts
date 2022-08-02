import {Type} from 'class-transformer';
import {PrTag} from './pr-tag.entity';
import {PrBaseEntityWithUser} from './pr-user.entity';


export class PrEntityWithTag extends PrBaseEntityWithUser {
  @Type(() => PrTag)
  tags: PrTag[];

  addTag(tag: PrTag): void {
    const index = this.tags.findIndex(t => t.key === tag.key);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
    this.tags.push(tag);

    this.tags = [...this.tags];
  }
}
