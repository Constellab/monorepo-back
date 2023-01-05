import {CaBaseEntity} from '../ca-base-entity.class';
import {Type} from 'class-transformer';
import {CaBrickVersion} from '../ca-brick.class';

export class CaLabConfig extends CaBaseEntity {

  label: string;

  @Type(() => CaBrickVersion)
  brickVersions: CaBrickVersion[];
}
