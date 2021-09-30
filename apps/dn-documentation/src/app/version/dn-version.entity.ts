import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DnVersion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({length: 20})
    versionNumber: string;
}
