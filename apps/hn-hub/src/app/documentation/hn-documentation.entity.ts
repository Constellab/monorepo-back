import {BlEntityWithId} from '@monorepo/back-core-lib';
import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {HnFolder} from '../folder/hn-folder.entity';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';

@Unique(['folder', 'order'])
@Entity('Documentation')
export class HnDocumentation extends HnBaseEntity {

  @Column()
  title: string;

  @Column({name: 'content', type: 'simple-json', nullable: true})
  content?: Record<string, any>;

  @Column()
  path: string;

  @Column()
  completePath: string;

  @Column()
  order: number;

  @ManyToOne(() => HnFolder)
  folder: HnFolder;

  static newDoc(pId: string, pTitle: string, pPath: string
    , pCompletePath: string, pOrder: number, pFolder: HnFolder): HnDocumentation
  {
    const newDoc: HnDocumentation = new HnDocumentation();
    newDoc.id = pId;
    newDoc.title = pTitle;
    newDoc.path = pPath;
    newDoc.completePath = pCompletePath;
    newDoc.order = pOrder;
    newDoc.folder = pFolder;
    return newDoc;
  }

}

export class HnDocumentationDTO {

  title: string;

  path: string;

  completePath?: string;

  order: number;

  constructor(documentation: HnDocumentation) {
    this.path = documentation.path;
    this.title = documentation.title;
    this.order = documentation.order;
  }
}

export class HnDocumentationResDTO extends HnBaseEntity {
  title: string;

  content: Record<string, any>;

  path: string;

  order: number;

  folderId: string;
}

export class HnDocumentationContentDTO extends HnBaseEntity {
  content: Record<string, any>;
}
