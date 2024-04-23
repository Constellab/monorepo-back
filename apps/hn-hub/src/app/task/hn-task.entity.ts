import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {Column, Entity, Unique} from 'typeorm';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('task')
export class HnTask extends HnGeneratedDocEntity {
  @Column({name: 'inputSpecs', type: 'simple-json', nullable: true})
  inputSpecs?: Record<string, any>;

  @Column({name: 'outputSpecs', type: 'simple-json', nullable: true})
  outputSpecs?: Record<string, any>;

  @Column({name: 'configSpecs', type: 'simple-json', nullable: true})
  configSpecs?: Record<string, any>;

  @Column({name: 'additionalInfo', type: 'simple-json', nullable: true})
  additionalInfo?: Record<string, any>;

  getFolderName(): string {
    return 'task';
  }

}
