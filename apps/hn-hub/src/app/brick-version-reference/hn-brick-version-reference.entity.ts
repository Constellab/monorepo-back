import {Column, Entity, OneToOne} from 'typeorm';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {HnBrickVersion} from '../brick-version/hn-brick-version.entity';

export enum HnBrickIdAndVersion {
  DIRECT = 'DIRECT',
  UNDIRECT = 'UNDIRECT'
}

@Entity('BrickVersionReference')
export class HnBrickVersionReference extends HnBaseEntity {

  // @BlNotUpdatable()
  // @ManyToOne(() => HnBrick, {eager: true, onDelete: "CASCADE"})
  // brick: HnBrick;

  @Column({type: 'enum', enum: HnBrickIdAndVersion, nullable: false})
  versionState: HnBrickIdAndVersion;

  @OneToOne(() => HnBrickVersion)
  brickVersion: HnBrickVersion;

}
