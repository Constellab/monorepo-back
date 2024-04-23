import {BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany} from 'typeorm';
import {HnCreateLiveTaskDto} from './hn-live-task.dto';
import {HnSpace} from '../../space-aggregate/space/hn-space.entity';
import {HnUser} from '../../users/hn-user.entity';
import {BlEntityWithId, BlLuxonDateTimeColumn} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {Type} from 'class-transformer';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {ClDateHelper} from '@monorepo/core-lib';
import {HnLiveTaskCoAuthor} from '../live-task-co-author/hn-live-task-co-author.entity';

@Entity('live_task')
export class HnLiveTask extends BlEntityWithId {
  @Column()
  title: string;

  @Column({name: 'description', type: 'simple-json', nullable: true})
  description?: Record<string, any>;

  @Column({name: 'description_backup', type: 'simple-json', nullable: true})
  descriptionBackup?: Record<string, any>;

  @Column({name: 'latest_publish_version', nullable: true})
  latestPublishVersion?: number;

  @ManyToOne(() => HnSpace, {eager: true})
  space?: HnSpace;

  @BlLuxonDateTimeColumn({nullable: true, update: false})
  createdAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, {eager: true, nullable: true})
  createdBy?: HnUser;

  @BlLuxonDateTimeColumn({nullable: true})
  lastModifiedAt: DateTime;

  @Type(() => HnUser)
  @ManyToOne(() => HnUser, {eager: true, nullable: true})
  lastModifiedBy: HnUser;

  @Column({nullable: true})
  parentLiveTaskVersionId?: string;

  @Column({default: 0})
  likes: number;

  @Column({default: 0})
  comments: number;

  @OneToMany(() => HnLiveTaskCoAuthor, liveTaskCoAuthor => liveTaskCoAuthor.user, {nullable: true, onDelete: 'CASCADE'})
  liveTaskCoAuthors: HnLiveTaskCoAuthor[];

  static init(liveTaskDto: HnCreateLiveTaskDto, parentLiveTaskVersionId?: string, user?: HnUser): HnLiveTask {
    const liveTask = new HnLiveTask();
    liveTask.title = liveTaskDto.title;
    liveTask.space = liveTaskDto.space;
    liveTask.parentLiveTaskVersionId = parentLiveTaskVersionId;
    liveTask.createdBy = user;
    liveTask.lastModifiedBy = user;
    return liveTask;
  }

  @BeforeInsert()
  setCreatedByUser(): void {
    if (this.createdBy == null){
      this.createdBy = HnCurrentUserHelper.getCurrentUser();
      this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser();
    }
    this.createdAt = ClDateHelper.getDate();
    this.lastModifiedAt = ClDateHelper.getDate();
  }

  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = HnCurrentUserHelper.getCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}
