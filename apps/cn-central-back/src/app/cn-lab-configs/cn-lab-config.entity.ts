import {Column, Entity, JoinTable, ManyToMany} from 'typeorm';
import {CnBrickVersion} from '../cn-bricks/cn-brick-version.entity';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {CnLabInstanceConfigDTO} from '../cn-lab-instances/cn-lab-instance.dto';

/**
 * A lab defined an environment to execute experiments
 * It contains a list of brick to defined available functionalities
 */
@Entity('lab_config')
export class CnLabConfig extends BlEntityWithId {

  @Column({nullable: false, length: 50})
  label: string;

  @ManyToMany(() => CnBrickVersion)
  @JoinTable({name: 'lab_config_brick_version'})
  brickVersions: CnBrickVersion[];

  @Column({nullable: false, unique: true})
  brickVersionsHash: number;

  toLabInstanceConfigDTO(): CnLabInstanceConfigDTO {
    if(this.brickVersions == null){
      throw new Error("Brick versions were not loaded in the CnLabConfig");
    }
    return {
      glabTag: null,
      brickVersions: this.brickVersions.map(brickVersion => ({
        name: brickVersion.brick.name,
        version: brickVersion.version.toString(),
      })),
    };
  }
}

