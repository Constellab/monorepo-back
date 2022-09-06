import {FlEntity} from '@monorepo/front-core-lib';

export interface PrResource extends FlEntity {
  name: string;

  resourceTypingName: string;
}
