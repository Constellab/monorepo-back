import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

export class HnBrickIdAndVersion{
  id: string;
  version?: number;
}

export class HnBrickPathVersion{
  id: string;
  path: string;
  version?: number;
}

@Unique(['brick', 'major', 'minor', 'patch'])
@Entity('BrickVersion')
export class HnBrickVersion extends HnBaseEntity {

  @BlNotUpdatable()
  @ManyToOne(() => HnBrick, {eager: true})
  brick: HnBrick;

  @Column({default: 1})
  major: number;

  @Column({default: 0})
  minor: number;

  @Column({default: 0})
  patch: number;

  @Column()
  isLatest: boolean = true;

  // Default : '1.0.0'
  getVersion(): string{
    return [this.major, this.minor, this.patch].join('.');
  }

  initialize(brick: HnBrick, version?: number[]){
    this.brick = brick;
    if(version && version.length == 3){
      this.major = version[0];
      this.minor = version[1];
      this.patch = version[2];
    }
  }
}
