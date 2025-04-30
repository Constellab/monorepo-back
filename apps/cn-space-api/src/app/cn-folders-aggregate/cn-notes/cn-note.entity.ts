import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { CnScenario, CnScenarioEntity } from '../cn-scenarios/cn-scenario.entity';
import { Type } from 'class-transformer';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { CnLab, CnLabEntity } from '../../cn-labs/cn-lab.entity';
import { CnDocument, CnDocumentEntity } from '../cn-documents/cn-document.entity';
import { CnHierarchyRepresentation } from '../cn_hierarchy_objects/cn-hierarchy-representation';
import { CnHierarchyObjectInfo } from '../cn_hierarchy_objects/cn-hierarchy-object.dto';
import { CnHierarchyObjectType } from '../cn_hierarchy_objects/cn-hierarchy-object.entity';

@Entity('note')
export class CnNoteEntity extends CnHierarchyRepresentation {
  @Column()
  title: string;

  @ManyToMany(() => CnScenarioEntity, (scenario) => scenario.notes)
  @JoinTable({ name: 'note_scenario' })
  scenarios: CnScenario[];

  @BlNotUpdatable()
  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, { nullable: false })
  lab: CnLab;

  @Type(() => CnLabConfig)
  @ManyToOne(() => CnLabConfig, { nullable: false })
  labConfig: CnLabConfig;

  @Column({ nullable: false, default: false })
  isValidated: boolean;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: true })
  validatedBy: CnUser;

  @BlLuxonDateTimeColumn({ nullable: true })
  validatedAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  lastSyncBy: CnUser;

  @BlLuxonDateTimeColumn({ nullable: false })
  lastSyncAt: DateTime;

  @Type(() => CnDocumentEntity)
  @ManyToOne(() => CnDocumentEntity, { nullable: true })
  document?: CnDocument;

  getHierarchyObjectInfo(): CnHierarchyObjectInfo {
    return {
      objectType: CnHierarchyObjectType.NOTE,
      name: this.title,
      user: this.lastModifiedBy,
      lastModifiedAt: this.lastModifiedAt,
      isValidated: this.isValidated,
      style: {
        icon_type: 'MATERIAL_ICON',
        icon_technical_name: 'note',
        background_color: 'primary',
        icon_color: 'primaryContrast',
      },
    };
  }
}

export type CnNoteWithDocument = Omit<CnNoteEntity, 'scenarios'>;

export type CnNote = Omit<CnNoteWithDocument, 'hierarchyRepresentation' | 'document'>;

export type CnNoteWithScenarios = Omit<CnNoteEntity, 'hierarchyRepresentation' | 'document'>;
