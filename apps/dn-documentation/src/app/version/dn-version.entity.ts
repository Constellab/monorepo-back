import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Column, Entity } from 'typeorm';

@Entity('Version')
export class DnVersion extends BlEntityWithId{
  @Column({length: 20})
  versionNumber: string;
}
