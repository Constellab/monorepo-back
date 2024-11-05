import { HnSpace } from './hn-space.entity';

export class HnSpaceDto {
  id: string;
  name: string;
  photo: string;

  constructor(space: HnSpace) {
    this.id = space.id;
    this.name = space.name;
    this.photo = space.photo;
  }
}
