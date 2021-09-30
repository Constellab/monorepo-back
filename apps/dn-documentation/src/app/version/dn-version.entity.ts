import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BlEntityWithId } from '@monorepo/back-core-lib';

@Entity()
export class DnVersion extends BlEntityWithId{

    @Column({length: 20})
    versionNumber: string;
}
