import { Column, Entity, Unique } from 'typeorm';

import { HnGeneratedDocTypingEntity } from '../core/model/entities/hn-generated-doc-typing.entity';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('protocol')
export class HnProtocol extends HnGeneratedDocTypingEntity {
  @Column({ type: 'simple-json', nullable: true })
  inputSpecs?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  outputSpecs?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  configSpecs?: Record<string, any>;

  @Column()
  status?: string;

  getFolderName(): string {
    return 'protocol';
  }
}
