import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { CnScenario } from '../cn-scenarios/cn-scenario.entity';
import { Exclude, Type } from 'class-transformer';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { BlLuxonDateTimeColumn, BlNotUpdatable, BlRichTextContent } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { CnLabEntity } from '../../cn-labs/cn-lab.entity';
import { CnDocumentEntity } from '../cn-documents/cn-document.entity';
import { CnHierarchyRepresentation } from '../cn_hierarchy_objects/cn-hierarchy-representation';
import { CnHierarchyObjectInfo } from '../cn_hierarchy_objects/cn-hierarchy-object.dto';
import { CnHierarchyObjectType } from '../cn_hierarchy_objects/cn-hierarchy-object.entity';

@Entity('note')
export class CnNote extends CnHierarchyRepresentation {

  @Column()
  title: string;

  @Exclude()
  @Column({ type: 'simple-json', nullable: true })
  content: BlRichTextContent;

  @ManyToMany(() => CnScenario, scenario => scenario.notes)
  @JoinTable({ name: 'note_scenario' })
  scenarios: CnScenario[];

  @BlNotUpdatable()
  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, { nullable: false })
  lab: CnLabEntity;

  @Type(() => CnLabConfig)
  @ManyToOne(() => CnLabConfig, { nullable: false })
  labConfig: CnLabConfig;

  @Column({ nullable: false, default: false })
  isValidated: boolean;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, { eager: true, nullable: true })
  validatedBy: CnUser;

  @BlLuxonDateTimeColumn({ nullable: true })
  validatedAt: DateTime;

  @Type(() => CnUser)
  @ManyToOne(() => CnUser, { eager: true, nullable: false })
  lastSyncBy: CnUser;

  @BlLuxonDateTimeColumn({ nullable: false })
  lastSyncAt: DateTime;

  @Type(() => CnDocumentEntity)
  @ManyToOne(() => CnDocumentEntity, { nullable: true })
  document?: CnDocumentEntity;

  getHierarchyObjectInfo(): CnHierarchyObjectInfo {
    return {
      objectType: CnHierarchyObjectType.NOTE,
      name: this.title,
      user: this.lastModifiedBy,
      lastModifiedAt: this.lastModifiedAt,
      isValidated: this.isValidated,
    };
  }


}
