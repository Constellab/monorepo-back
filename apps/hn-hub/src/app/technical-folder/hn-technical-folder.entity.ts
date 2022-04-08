import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {Entity, ManyToOne} from 'typeorm';


@Entity('TechnicalFolder')
export class HnTechnicalFolder extends BlEntityWithId {
  @ManyToOne(() => HnBrickMajorVersion, {eager: true, nullable: false})
  brickMajorVersion: HnBrickMajorVersion;
}
