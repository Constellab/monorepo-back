import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DnVersion } from '../version/dn-version.entity';
import { BlEntityWithId } from '@monorepo/back-core-lib';

@Entity()
export class DnDocumentation extends BlEntityWithId{

    @Column()
    title: string;

    @Column('text')
    content: string;

    @ManyToOne(() => DnVersion)
    version: DnVersion;

    @Column()
    path: string;
}
