import {BeforeInsert, BeforeUpdate} from 'typeorm';
import {ClDateHelper} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../../utils/cn-current-user.helper';
import {CnEntity} from './cn.entity';

/**
 * Basic entity with same info as CnEntity,
 * but with the @BeforeInsert() and @BeforeUpdate() methods
 * to set the creation and modification info automatically
 */
export abstract class
CnBaseEntity extends CnEntity {

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}
