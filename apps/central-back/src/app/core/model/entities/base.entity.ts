import {EntityWithId} from './entity-with-id.entity';
import {BeforeInsert, BeforeUpdate, CreateDateColumn, ManyToOne, UpdateDateColumn} from 'typeorm';
import {User} from '../../../users/user.entity';
import {RequestContextHelper} from '../../modules/request-context/request-context.helper';
import {Type} from 'class-transformer';
import {DateTransform} from '../../decorators/date-transform.decorator';

export abstract class BaseEntity extends EntityWithId {

  @DateTransform()
  @CreateDateColumn({nullable: false, update: false})
  createdAt: Date;

  @Type(() => User)
  @ManyToOne(() => User, {eager: true, nullable: false})
  createdBy: User;

  @DateTransform()
  @UpdateDateColumn()
  lastModifiedAt: Date;

  @Type(() => User)
  @ManyToOne(() => User, {eager: true})
  lastModifiedBy: User;

  @BeforeInsert()
  setCreatedByUser(): void {
    this.createdBy = RequestContextHelper.getAndCheckCurrentUser();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedByUser(): void {
    this.lastModifiedBy = RequestContextHelper.getAndCheckCurrentUser();
  }

}
