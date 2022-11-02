import {CaBaseEntity} from './ca-base-entity.class';
import {CaGroup} from './ca-group.entity';
import {Type} from 'class-transformer';


export type CaLabInstanceGroupRole = 'OWNER' | 'USER';

/**
 * Entity for N to N relation between lab instance and group
 */
export class CaLabInstanceGroup extends CaBaseEntity {

  @Type(() => CaGroup)
  group: CaGroup;

  role: CaLabInstanceGroupRole;
}
