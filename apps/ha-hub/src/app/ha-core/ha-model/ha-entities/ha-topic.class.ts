import {HaStory} from './ha-story.class';

export class HaTopic {
  id: string;
  name: string;

  popularity: number;
  stories: HaStory[];
}

export class HaTopicDto {
  name: string;
  id?: string;

  constructor(name: string, id?: string) {
    this.name = name;
    this.id = id;
  }
}
