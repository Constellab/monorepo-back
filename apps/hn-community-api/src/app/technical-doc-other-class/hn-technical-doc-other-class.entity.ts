import { Column, Entity, Unique } from 'typeorm';

import { HnGeneratedDocEntity } from '../core/model/entities/hn-generated-doc-typing.entity';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('technical_doc_other_class')
export class HnTechnicalDocOtherClass extends HnGeneratedDocEntity {
  @Column({ type: 'simple-json', nullable: true })
  variables!: Record<string, any> | null;

  @Column({ type: 'simple-json', nullable: true })
  methods!: Record<string, any> | null;

  objectType!: string;

  getFolderName(): string {
    return 'other-classes';
  }
}
