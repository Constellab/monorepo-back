import { HnStoryCategory } from "./hn-story.entity";

export class HnCreateStoryDto {
  title: string;

  category: HnStoryCategory;
}
