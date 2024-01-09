import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {CnProject} from '../cn-projects/cn-project.entity';
import {BlNotUpdatable, BlRichTextI} from '@monorepo/back-core-lib';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';


@Entity('document')
@Unique(['name', 'projectId'])
export class CnDocument extends CnBaseEntity {

  @Column({nullable: false})
  name: string;

  @Column({nullable: false})
  filename: string;

  @Column({nullable: false})
  size: number;

  @Column({nullable: false})
  mimeType: string;

  @BlNotUpdatable()
  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {nullable: false})
  project: CnProject;

  @Column()
  projectId: string;

  @Column({nullable: false, default: false})
  isConstellabDocument: boolean;

  // TODO TO REMOVE
  @Exclude()
  @Column({type: 'simple-json', nullable: true})
  oldContent: BlRichTextI;

  @Column({nullable: false, default: false})
  inTrash: boolean;
}
