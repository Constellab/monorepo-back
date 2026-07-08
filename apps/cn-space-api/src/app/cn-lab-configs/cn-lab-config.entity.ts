import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { CnBrickVersion } from '../cn-bricks/cn-brick-version.entity';
import { CnLabConfigDTO } from '../cn-labs/cn-lab.dto';

/**
 * A lab defined an environment to execute scenarios
 * It contains a list of brick to defined available functionalities
 */
@Entity('lab_config')
export class CnLabConfig extends BlEntityWithId {
  @Column({ nullable: false, length: 50 })
  label!: string;

  @ManyToMany(() => CnBrickVersion)
  @JoinTable({ name: 'lab_config_brick_version' })
  brickVersions!: CnBrickVersion[];

  @Column({ nullable: false, unique: true })
  brickVersionsHash!: number;

  toLabConfigDTO(): CnLabConfigDTO {
    if (this.brickVersions == null) {
      throw new Error('Brick versions were not loaded in the CnLabConfig');
    }
    return {
      brickVersions: this.brickVersions.map((brickVersion) => ({
        name: brickVersion.brick.name,
        version: brickVersion.version.toString(),
      })),
    };
  }
}
