import {BlEntityWithId} from '@monorepo/back-core-lib';
import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {DnFolder} from '../folder/dn-folder.entity';
import {DnBaseEntity} from '../core/model/entities/dn-base.entity';

@Unique(['folder', 'order'])
@Entity('Documentation')
export class DnDocumentation extends DnBaseEntity {

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

  static newDoc(pId: string, pTitle: string, pContent: string, pPath: string
    , pCompletePath: string, pOrder: number, pFolder: DnFolder): DnDocumentation
  {
    const newDoc: DnDocumentation = new DnDocumentation();
    newDoc.id = pId;
    newDoc.title = pTitle;
    newDoc.content = pContent;
    newDoc.path = pPath;
    newDoc.completePath = pCompletePath;
    newDoc.order = pOrder;
    newDoc.folder = pFolder;
    return newDoc;
  }

  constructor() {
    super();
  }
}

export class DnDocumentationDTO {

  title: string;

  path: string;

  completePath?: string;

  order: number;

  constructor(documentation: DnDocumentation) {
    this.path = documentation.path;
    this.title = documentation.title;
    this.order = documentation.order;
  }
}

export class DnDocumentationResDTO extends DnBaseEntity {
  title: string;

  content: string;

  path: string;

  order: number;

  folderId: string;
}
