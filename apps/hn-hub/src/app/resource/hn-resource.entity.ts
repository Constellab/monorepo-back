import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {Entity, Unique} from 'typeorm';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('Resource')
export class HnResource extends HnGeneratedDocEntity {
  getFolderName(): string {
    return 'resource';
  }


}
