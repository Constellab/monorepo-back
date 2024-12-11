import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { Exclude, Type } from 'class-transformer';
import { CnLabEntity } from '../../cn-labs/cn-lab.entity';
import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { CnNote, CnNoteEntity } from '../cn-notes/cn-note.entity';
import { CnScenarioStatus } from './cn-scenario-status.enum';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { DateTime } from 'luxon';
import { CnHierarchyRepresentation } from '../cn_hierarchy_objects/cn-hierarchy-representation';
import { CnHierarchyObjectInfo } from '../cn_hierarchy_objects/cn-hierarchy-object.dto';
import { CnHierarchyObjectType } from '../cn_hierarchy_objects/cn-hierarchy-object.entity';
import { TeRichTextInput } from '@monorepo/te-text-editor';

export interface CnScenarioProtocol {
  version: number;
  data: any;
}

/**
 * A scenario is executed in a lab to produce notes
 *
 * It is defined as a succession of jobs
 */
@Entity('scenario')
export class CnScenarioEntity extends CnHierarchyRepresentation {
  @Column({ nullable: false, length: 50 })
  title: string;

  @Column({ type: 'simple-json', array: false, nullable: true })
  description: TeRichTextInput;

  @Column({ type: 'enum', enum: CnScenarioStatus, nullable: false })
  status: CnScenarioStatus;

  @BlNotUpdatable()
  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, { nullable: false, eager: true })
  lab: CnLabEntity;

  @BlNotUpdatable()
  @Type(() => CnLabConfig)
  @ManyToOne(() => CnLabConfig, { nullable: false })
  labConfig: CnLabConfig;

  @ManyToMany(() => CnNoteEntity, (note) => note.scenarios)
  notes: CnNote[];

  @Exclude()
  @Column({ type: 'simple-json', nullable: false })
  protocol: CnScenarioProtocol;

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

  getHierarchyObjectInfo(): CnHierarchyObjectInfo {
    return {
      objectType: CnHierarchyObjectType.SCENARIO,
      name: this.title,
      user: this.lastModifiedBy,
      lastModifiedAt: this.lastModifiedAt,
      isValidated: this.isValidated,
      style: {
        icon_type: 'MATERIAL_ICON',
        icon_technical_name: 'scenario',
        background_color: 'warn',
        icon_color: 'warnContrast',
      },
    };
  }
}

export type CnScenarioWithHierarchy = Omit<CnScenarioEntity, 'notes' | 'lab' | 'labConfig'>;
export type CnScenario = Omit<CnScenarioWithHierarchy, 'hierarchyRepresentation'>;

export type CnScenarioWithNotes = Omit<CnScenarioEntity, 'hierarchyRepresentation' | 'lab' | 'labConfig'>;
