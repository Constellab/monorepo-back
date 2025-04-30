import { Column, Entity, Unique } from 'typeorm';
import { HnGeneratedDocEntity } from '../core/model/entities/hn-generated-doc-typing.entity';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('technical_doc_other_class')
export class HnTechnicalDocOtherClass extends HnGeneratedDocEntity {
  @Column({ name: 'variables', type: 'simple-json', nullable: true })
  variables?: Record<string, any>;

  @Column({ name: 'methods', type: 'simple-json', nullable: true })
  methods?: Record<string, any>;

  objectType: string;

  getFolderName(): string {
    return 'other-classes';
  }
}
