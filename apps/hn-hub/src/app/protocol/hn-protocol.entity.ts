import {HnGeneratedDocTypingEntity} from '../core/model/entities/hn-generated-doc-typing.entity';
import {Column, Entity, Unique} from 'typeorm';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('protocol')
export class HnProtocol extends HnGeneratedDocTypingEntity {

  @Column({name: 'inputSpecs', type: 'simple-json', nullable: true})
  inputSpecs?: Record<string, any>;

  @Column({name: 'outputSpecs', type: 'simple-json', nullable: true})
  outputSpecs?: Record<string, any>;

  @Column({name: 'configSpecs', type: 'simple-json', nullable: true})
  configSpecs?: Record<string, any>;

  @Column()
  status?: string;

  getFolderName(): string {
    return 'protocol';
  }


}
