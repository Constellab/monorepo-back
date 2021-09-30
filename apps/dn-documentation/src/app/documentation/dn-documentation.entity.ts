import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DnVersion } from '../version/dn-version.entity';

@Entity()
export class DnDocumentation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @ManyToOne(() => DnVersion)
    version: DnVersion;

    @Column()
    path: string;
}
