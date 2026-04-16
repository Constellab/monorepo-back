import {
  TeRichText,
  TeRichTextAggregate,
  TeRichTextDTO,
  TeRichTextModifications,
} from '@monorepo/te-text-editor';
import { Column, Entity, ManyToOne } from 'typeorm';

import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';
import { HnFolder } from '../folder/hn-folder.entity';

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

  @Column({ type: 'simple-json', nullable: true })
  content?: TeRichTextDTO;

  @Column({ type: 'longtext', nullable: true })
  modifications: string;

  // TODO: TO REMOVE
  @Column({ type: 'longtext', nullable: true })
  modificationsBackup: string;

  @Column()
  path: string;

  @Column()
  completePath: string;

  @Column()
  order: number;

  @ManyToOne(() => HnFolder, { eager: true, onDelete: 'CASCADE', nullable: false })
  folder: HnFolder;

  public setPath(path: string, folderCompletePath: string): void {
    this.path = path;

    if (folderCompletePath != null) {
      this.completePath = folderCompletePath + path + '/';
    } else {
      this.completePath = path + '/';
    }
    // Ensure no special characters
    this.completePath = this.completePath.replace(/[^a-zA-Z0-9-_/]/g, '');
  }

  public getRichText(): TeRichText {
    return new TeRichText(this.content);
  }

  public getRichTextAggregate(): TeRichTextAggregate {
    const richText = this.getRichText();
    const modifications = TeRichTextModifications.fromJsonObjectString(this.modifications);

    return new TeRichTextAggregate(richText, modifications);
  }

  public setRichTextAggregate(richText: TeRichTextAggregate): void {
    this.content = richText.richText.toJson();
    this.modifications = richText.getModificationsAsString();
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
