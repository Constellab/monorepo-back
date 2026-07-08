import { Column, Entity } from 'typeorm';

import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';

/**
 * Abstraction for the server of cloud providers
 */
@Entity('server_standard')
export class CnServerStandard extends CnBaseEntity {
  @Column({ nullable: false, length: 50, unique: true })
  name!: string;

  @Column({ nullable: false })
  description!: string;

  @Column({ nullable: false })
  technicalDescription!: string;
}
