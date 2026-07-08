import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';

export class CnCommunityUserDto extends BlEntityWithIdDTO {
  firstname!: string;
  lastname!: string;
  photo!: string;
}
