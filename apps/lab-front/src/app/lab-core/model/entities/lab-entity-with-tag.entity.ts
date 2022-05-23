import {Type} from 'class-transformer';
import {LabTag} from './lab-tag.entity';
import {LabBaseEntityWithUser} from './lab-user.entity';


export class LabEntityWithTag extends LabBaseEntityWithUser{
  @Type(() => LabTag)
  tags: LabTag[];

  addTag(tag: LabTag): void {
    const index = this.tags.findIndex(t => t.key === tag.key);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
    this.tags.push(tag);

    this.tags = [...this.tags];
  }
}
