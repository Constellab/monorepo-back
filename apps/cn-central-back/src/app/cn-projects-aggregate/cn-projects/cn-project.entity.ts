import {Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {CnEntityWithStatus} from '../../cn-core/model/entities/cn-entity-with-status.entity';
import {DateTime} from 'luxon';
import {BlLuxonDateColumn} from '@monorepo/back-core-lib';
import {CnGroup} from '../../cn-groups/cn-group.entity';
import {BadRequestException} from '@nestjs/common';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * A project is an ensemble of experiments
 */
@Entity('project')
export class CnProject extends CnEntityWithStatus<CnProjectStatusHistory> {

  @Column({nullable: false, length: 20})
  code: string;

  @Column({nullable: false, length: 50})
  title: string;

  @Column({type: 'text', nullable: true})
  description: string;

  @BlLuxonDateColumn({nullable: false})
  startingDate: DateTime;

  @BlLuxonDateColumn({nullable: true})
  endingDate: DateTime;

  @Type(() => CnProjectStatusHistory)
  @OneToOne(() => CnProjectStatusHistory, {nullable: true, eager: true})
  @JoinColumn()
  currentStatus: CnProjectStatusHistory;

  @Exclude()
  @ManyToMany(() => CnGroup)
  @JoinTable({name: 'project_group'})
  sharedGroups: CnGroup[];

  public isSharedToGroup(groupId: string | string[]): boolean {
    if (this.sharedGroups == null) {
      throw new BadRequestException('The sharedGroups are not loaded in the project entity');
    }

    // check if one of the provided group is a shared group of the project
    const groupIds = ClHelpService.convertObjectOrArrayToArray(groupId);
    return this.sharedGroups.find(group => groupIds.includes(group.id)) != null;
  }

  public removeSharedGroup(groupId: string): void {
    const index = this.sharedGroups.findIndex(group => group.id === groupId);

    if (index >= 0) {
      this.sharedGroups.splice(index, 1);
    }
  }
}
