import { HnStoryCategory } from "./hn-story.entity";

export class HnCreateStoryDto {
  title: string;

  category: HnStoryCategory;
}

export class HnStoryFilter {
  categories: string[];
  topics: string[];
  title: string;
}
