import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Version {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({length: 20})
    version: string;
}
