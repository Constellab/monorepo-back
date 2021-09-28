import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Version } from '../version/dn-version.entity';

@Entity()
export class Documentation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @ManyToOne(() => Version)
    version: Version;

    @Column({length: 255})
    path: string;
}
