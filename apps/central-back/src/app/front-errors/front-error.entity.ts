import {BeforeInsert, Column, Entity, ManyToOne} from 'typeorm';
import {EntityWithId} from '../core/model/entities/entity-with-id.entity';
import {Type} from 'class-transformer';
import {User} from '../users/user.entity';
import {LuxonDateTimeColumn} from '../core/decorators/luxon-column.decorator';
import {DateTime} from 'luxon';
import {RequestContextHelper} from '../core/modules/request-context/request-context.helper';
import {ClDateHelper} from '@monorepo/core-lib';

/**
 * Entity to store the front errors
 */
@Entity()
export class FrontError extends EntityWithId{

  @Column({nullable: false, length: 100})
  name: string;

  @Column({nullable: false, length: 1000})
  message: string;

  @Column({type: 'text', nullable: true})
  stackTrace: string;

  @Column({nullable: true, length: 200})
  route: string;

  @Type(() => User)
  @ManyToOne(() => User, {eager: true, nullable: true})
  createdBy: User;

  @LuxonDateTimeColumn({nullable: false, update: false})
  createdAt: DateTime;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = RequestContextHelper.getCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }
}
