import { Type } from 'class-transformer';
import { Column, ManyToOne } from 'typeorm';

import { HnTechnicalFolder } from '../../../technical-folder/hn-technical-folder.entity';
import { HnBaseEntity } from './hn-base.entity';

export abstract class HnGeneratedDocEntity extends HnBaseEntity {
  @Column()
  brickName!: string;

  @Column()
  brickMajor!: number;

  @Column()
  uniqueName!: string;

  @Column()
  humanName!: string;

  @Column({ type: 'text', nullable: true })
  doc!: string | null;

  @Type(() => HnTechnicalFolder)
  @ManyToOne(() => HnTechnicalFolder, { eager: true, nullable: false, onDelete: 'CASCADE' })
  technicalFolder!: HnTechnicalFolder;

  abstract getFolderName(): string;

  getCompletePath(): string {
    return `${this.getFolderName()}/${this.uniqueName}`;
  }
}

export abstract class HnGeneratedDocTypingEntity extends HnGeneratedDocEntity {
  @Column({ nullable: true, type: 'varchar' })
  shortDescription!: string | null;

  @Column()
  typingName!: string;

  @Column({ nullable: true, type: 'varchar' })
  parentHumanName!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  parentTypingName!: string | null;

  @Column({ nullable: true, type: 'int' })
  parentMajorVersion!: number | null;

  @Column({ nullable: true, type: 'varchar' })
  parentVersion!: string | null;

  @Column()
  hide!: boolean;

  @Column({ nullable: true, type: 'varchar' })
  deprecatedSince!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  deprecatedMessage!: string | null;

  @Column({ type: 'simple-json', nullable: true })
  style!: Record<string, any> | null;

  @Column({ nullable: true, type: 'varchar' })
  objectSubType!: string | null;

  objectType!: string;
}
