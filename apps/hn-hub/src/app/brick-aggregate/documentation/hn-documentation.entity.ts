import {Column, Entity, ManyToOne} from 'typeorm';
import {HnFolder} from '../folder/hn-folder.entity';
import {HnBaseEntity} from '../../core/model/entities/hn-base.entity';

export interface HnDocumentationSearchDTO {
  id: string;
  name: string;
  completePath: string;
  anchor?: string;
  brickName?: string;
  major?: string;
  isTechnical?: boolean;
}

@Entity('documentation')
export class HnDocumentation extends HnBaseEntity {

  @Column()
  title: string;

  @Column({name: 'content', type: 'simple-json', nullable: true})
  content?: Record<string, any>;

  @Column({type: 'longtext', nullable: true})
  modifications: string;

  // TODO: TO REMOVE
  @Column({type: 'longtext', nullable: true, name: 'modifications_backup'})
  modificationsBackup: string;

  @Column()
  path: string;

  @Column()
  completePath: string;

  @Column()
  order: number;

  @ManyToOne(() => HnFolder, {eager: true, onDelete: 'CASCADE'})
  folder: HnFolder;

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

