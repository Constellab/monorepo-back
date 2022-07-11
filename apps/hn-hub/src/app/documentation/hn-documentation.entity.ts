import {Column, Entity, ManyToOne} from 'typeorm';
import {HnFolder} from '../folder/hn-folder.entity';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';

export interface HnDocumentationSearchDTO {
  id: string;
  name: string;
  completePath: string;
  anchor?: string;
  brickName?: string;
  major?: string;
  isTechnical?: boolean;
}

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

  @ManyToOne(() => HnFolder, {onDelete: "CASCADE"})
  folder: HnFolder;

  static newDoc(pId: string, pTitle: string, pPath: string
    , pCompletePath: string, pOrder: number, pFolder: HnFolder): HnDocumentation {
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

