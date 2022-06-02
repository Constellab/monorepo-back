import {BlEntityWithId} from '@monorepo/back-core-lib';
import {Column, ManyToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {HnTechnicalFolder} from '../../../technical-folder/hn-technical-folder.entity';

export abstract class HnGeneratedDocEntity extends BlEntityWithId {
  @Column()
  brickName: string;

  @Column()
  brickMajor: number;

  @Column()
  uniqueName: string;

  @Column()
  humanName: string;

  @Column({nullable: true})
  shortDescription?: string;

  @Column({type: 'text', nullable: true})
  doc: string;

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

  @Type(() => HnTechnicalFolder)
  @ManyToOne(() => HnTechnicalFolder, {eager: true, nullable: false})
  technicalFolder: HnTechnicalFolder;

  @Column({nullable: true})
  objectSubType: string;

  objectType: string;
}
