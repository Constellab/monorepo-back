import { Column, Entity, Unique } from 'typeorm';

import { HnGeneratedDocTypingEntity } from '../core/model/entities/hn-generated-doc-typing.entity';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('protocol')
export class HnProtocol extends HnGeneratedDocTypingEntity {
  @Column({ type: 'simple-json', nullable: true })
  inputSpecs!: Record<string, any> | null;

  @Column({ type: 'simple-json', nullable: true })
  outputSpecs!: Record<string, any> | null;

  @Column({ type: 'simple-json', nullable: true })
  configSpecs!: Record<string, any> | null;

  @Column({ type: 'varchar' })
  status!: string | null;

  getFolderName(): string {
    return 'protocol';
  }
}
