import {BaseEntity} from './base.entity';
import {DateTransform} from '../../decorators/date-transform.decorator';
import {EntityWithId} from './entity-with-id.entity';
import {Column} from 'typeorm';

/**
 * Describe a status history table
 */
export abstract class StatusHistory<S> extends BaseEntity {

  @Column({nullable: true})
  @DateTransform()
  endDate: Date;

  // status of this history
  status: S;

  // entity link that has the status
  entity: EntityWithId;
}
