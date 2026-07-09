import { Entity, ManyToOne } from 'typeorm';

import { HnDocumentation } from '../../brick-aggregate/documentation/hn-documentation.entity';
import { HnAbstractFileEntity } from '../file-core/hn-abstract-file.entity';

@Entity('file_documentation')
export class HnFileDocumentation extends HnAbstractFileEntity<HnDocumentation> {
  @ManyToOne(() => HnDocumentation, { nullable: false, onDelete: 'CASCADE' })
  entity!: HnDocumentation;
}
