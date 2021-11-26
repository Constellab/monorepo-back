import {BlEntityWithId} from '@monorepo/back-core-lib';
import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {DnFolder} from '../folder/dn-folder.entity';

@Unique(['folder', 'order'])
@Entity('Documentation')
export class DnDocumentation extends BlEntityWithId {

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  path: string;

  @Column()
  completePath: string;

  @Column()
  order: number;

  @ManyToOne(() => DnFolder)
  folder: DnFolder;
}

export class DnDocumentationDTO {

  title: string;

  path: string;

  completePath?: string;

  order:number;

  constructor(documentation: DnDocumentation) {
    this.path = documentation.path;
    this.title = documentation.title;
    this.order = documentation.order;
  }
}

export class DnDocumentationResDTO extends BlEntityWithId{
  title: string;

  content: string;

  path: string;

  order: number;

  folderId: string;
}
