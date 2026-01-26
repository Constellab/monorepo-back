import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { Column, ManyToOne } from 'typeorm';

import { HnTechnicalFolderDto } from '../../../technical-folder/hn-technical-folder.dto';
import { HnTechnicalFolder } from '../../../technical-folder/hn-technical-folder.entity';
import { HnGeneratedDocDto } from './hn-generated-doc.dto';

export abstract class HnGeneratedDocEntity extends BlEntityWithId {
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
  @ManyToOne(() => HnTechnicalFolder, { eager: true, nullable: false })
  technicalFolder: HnTechnicalFolder;

  abstract getFolderName(): string;

  getCompletePath(): string {
    return `${this.getFolderName()}/${this.uniqueName}`;
  }

  toDto(): HnGeneratedDocDto {
    const dto: HnGeneratedDocDto = (({ technicalFolder, ...o }) => o)(this);
    dto.technicalFolder = new HnTechnicalFolderDto(this.technicalFolder);
    return dto;
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

  @Column({ name: 'style', type: 'simple-json', nullable: true })
  style?: Record<string, any>;

  @Column({ nullable: true })
  objectSubType: string;

  objectType: string;
}

export class HnGeneratedDocDTO {
  id: string;
  brickName: string;
  brickMajor: number;
  uniqueName: string;
  humanName: string;
  technicalFolder?: HnTechnicalFolderDto;

  constructor(generatedDocEntity: HnGeneratedDocEntity) {
    this.id = generatedDocEntity.id;
    this.brickName = generatedDocEntity.brickName;
    this.brickMajor = generatedDocEntity.brickMajor;
    this.uniqueName = generatedDocEntity.uniqueName;
    this.humanName = generatedDocEntity.humanName;
    this.technicalFolder = new HnTechnicalFolderDto(generatedDocEntity.technicalFolder);
  }
}
