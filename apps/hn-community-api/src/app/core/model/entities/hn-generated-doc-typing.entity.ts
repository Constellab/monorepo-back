import { Type } from 'class-transformer';
import { Column, ManyToOne } from 'typeorm';

import { HnTechnicalFolder } from '../../../technical-folder/hn-technical-folder.entity';
import { HnBaseEntity } from './hn-base.entity';

export abstract class HnGeneratedDocEntity extends HnBaseEntity {
  @Column()
  brickName: string;

  @Column()
  brickMajor: number;

  @Column()
  uniqueName: string;

  @Column()
  humanName: string;

  @Column({ type: 'text', nullable: true })
  doc: string;

  @Type(() => HnTechnicalFolder)
  @ManyToOne(() => HnTechnicalFolder, { eager: true, nullable: false, onDelete: 'CASCADE' })
  technicalFolder: HnTechnicalFolder;

  abstract getFolderName(): string;

  getCompletePath(): string {
    return `${this.getFolderName()}/${this.uniqueName}`;
  }
}

export abstract class HnGeneratedDocTypingEntity extends HnGeneratedDocEntity {
  @Column({ nullable: true })
  shortDescription?: string;

  @Column()
  typingName: string;

  @Column({ nullable: true })
  parentHumanName?: string;

  @Column({ nullable: true })
  parentTypingName?: string;

  @Column({ nullable: true })
  parentMajorVersion?: number;

  @Column({ nullable: true })
  parentVersion?: string;

  @Column()
  hide: boolean;

  @Column({ nullable: true })
  deprecatedSince?: string;

  @Column({ nullable: true })
  deprecatedMessage?: string;

  @Column({ type: 'simple-json', nullable: true })
  style?: Record<string, any>;

  @Column({ nullable: true })
  objectSubType: string;

  objectType: string;
}
