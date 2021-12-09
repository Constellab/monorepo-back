import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {DnBrick} from '../brick/dn-brick.entity';
import {DnBaseEntity} from '../core/model/entities/dn-base.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

export class DnBrickIdAndVersion{
  brickId: string;
  version?: number[];
}



@Unique(['brick', 'major', 'minor', 'patch'])
@Entity('BrickVersion')
export class DnBrickVersion extends DnBaseEntity {

  @BlNotUpdatable()
  @ManyToOne(() => DnBrick, {eager: true})
  brick: DnBrick;

  @Column()
  major: number = 1;

  @Column()
  minor: number = 0;

  @Column()
  patch: number = 0;

  @Column()
  isLatest: boolean = true;

  // Default : '1.0.0'
  getVersion(): string{
    return [this.major, this.minor, this.patch].join('.');
  }

  constructor(brick: DnBrick, version: number[] = []) {
    super();
    this.brick = brick;
    if(version.length == 3) {
      this.major = version[0];
      this.minor = version[1];
      this.patch = version[2];
    }
  }
}
