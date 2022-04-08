import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {HnTechnicalFolder} from '../technical-folder/hn-technical-folder.entity';
import {Entity, ManyToOne, Unique} from 'typeorm';
import {Type} from 'class-transformer';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('Resource')
export class HnResource extends HnGeneratedDocEntity {
  @Type(() => HnTechnicalFolder)
  @ManyToOne(() => HnTechnicalFolder, {eager: true, nullable: false})
  technicalFolder: HnTechnicalFolder;
}
