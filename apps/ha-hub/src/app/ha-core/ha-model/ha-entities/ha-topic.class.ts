import {HaStory} from './ha-story.class';

export class HaTopic {
  id: string;
  name: string;
  stories: HaStory[];
}

export class HaTopicDto {
  name: string;
  id?: string;
}
