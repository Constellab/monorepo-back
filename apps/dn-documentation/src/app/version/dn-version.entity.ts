import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Version {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    version: string;

    @Column('text')
    content: string;
}
