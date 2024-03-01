import {Column, Entity, ManyToOne, OneToMany} from 'typeorm';
import {HnFolder} from '../folder/hn-folder.entity';
import {HnBaseEntity} from '../../core/model/entities/hn-base.entity';
import {HnStoryFile} from '../../story-file/hn-story-file.entity';
import {HnDocumentationFile} from '../documentation-file/hn-documentation-file.entity';

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

  @Column({name: 'content_backup', type: 'simple-json', nullable: true})
  contentBackup?: Record<string, any>;

  @Column()
  path: string;

  @Column()
  completePath: string;

  @Column()
  order: number;

  @ManyToOne(() => HnFolder, {eager: true, onDelete: 'CASCADE'})
  folder: HnFolder;

  @OneToMany(() => HnDocumentationFile, docFile => docFile.documentation, {nullable: true, eager: true})
  docFiles: HnDocumentationFile[];

  public setPath(path: string, folderCompletePath: string): void {
    this.path = path;

    if (folderCompletePath != null) {
      this.completePath = folderCompletePath + path + '/';
    } else {
      this.completePath = path + '/';
    }
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

