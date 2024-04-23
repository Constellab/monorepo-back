import {HnBrickMajorVersion} from '../brick-aggregate/brick-major-version/hn-brick-major-version.entity';
import {Entity, ManyToOne} from 'typeorm';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';


@Entity('technical_folder')
export class HnTechnicalFolder extends HnBaseEntity {
  @ManyToOne(() => HnBrickMajorVersion, {eager: true, nullable: false})
  brickMajorVersion: HnBrickMajorVersion;
}
