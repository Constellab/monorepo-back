import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {Column, Entity, Unique} from 'typeorm';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('Resource')
export class HnResource extends HnGeneratedDocEntity {

  @Column({name: 'methods', type: 'simple-json', nullable: true})
  methods?: Record<string, any>;

  getFolderName(): string {
    return 'resource';
  }
}
