import { Column, Entity, IsNull, Not, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Documentation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text')
    content: string;
}
