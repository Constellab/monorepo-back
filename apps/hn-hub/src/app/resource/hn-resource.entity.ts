import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {Column, Entity, Unique} from 'typeorm';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('resource')
export class HnResource extends HnGeneratedDocEntity {

  @Column({name: 'variables', type: 'simple-json', nullable: true})
  variables?: Record<string, any>;

  @Column({name: 'methods', type: 'simple-json', nullable: true})
  methods?: Record<string, any>;

  getFolderName(): string {
    return 'resource';
  }
}
