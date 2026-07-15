import { Column, Entity, Unique } from 'typeorm';

import { HnGeneratedDocTypingEntity } from '../core/model/entities/hn-generated-doc-typing.entity';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('resource')
export class HnResource extends HnGeneratedDocTypingEntity {
  @Column({ type: 'simple-json', nullable: true })
  variables!: Record<string, any> | null;

  @Column({ type: 'simple-json', nullable: true })
  methods!: Record<string, any> | null;

  getFolderName(): string {
    return 'resource';
  }
}
