import {BlEntityWithId} from '@monorepo/back-core-lib';
import {Column, ManyToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {HnTechnicalFolder} from '../../../technical-folder/hn-technical-folder.entity';
import {HnGeneratedDocDto} from './hn-generated-doc.dto';
import {HnTechnicalFolderDto} from '../../../technical-folder/hn-technical-folder.dto';

export abstract class HnGeneratedDocEntity extends BlEntityWithId {
  @Column()
  brickName: string;

  @Column()
  brickMajor: number;

  @Column()
  uniqueName: string;

  @Column()
  humanName: string;

  @Column({type: 'text', nullable: true})
  doc: string;

  @Type(() => HnTechnicalFolder)
  @ManyToOne(() => HnTechnicalFolder, {eager: true, nullable: false})
  technicalFolder: HnTechnicalFolder;

  abstract getFolderName(): string;

  getCompletePath(): string{
    return `${this.getFolderName()}/${this.uniqueName}`;
  }

  toDto(): HnGeneratedDocDto {
    const dto: HnGeneratedDocDto = (({technicalFolder, ...o}) => o)(this);
    dto.technicalFolder = new HnTechnicalFolderDto(this.technicalFolder);
    return dto;
  }
}

export abstract class HnGeneratedDocTypingEntity extends HnGeneratedDocEntity {

  @Column({nullable: true})
  shortDescription?: string;

  @Column()
  typingName: string;

  @Column({nullable: true})
  parentHumanName?: string;

  @Column({nullable: true})
  parentTypingName?: string;

  @Column({nullable: true})
  parentMajorVersion?: number;

  @Column({nullable: true})
  parentVersion?: string;

  @Column()
  hide: boolean;

  @Column({nullable: true})
  deprecatedSince?: string;

  @Column({nullable: true})
  deprecatedMessage?: string;

  @Column({name: 'style', type: 'simple-json', nullable: true})
  style?: Record<string, any>;

  @Column({nullable: true})
  objectSubType: string;

  objectType: string;
}
