import { BlNotUpdatable } from '@monorepo/back-core-lib';
import { Column, Entity, ManyToOne, OneToMany, Tree, TreeChildren, TreeParent } from 'typeorm';

import { HnBaseEntity } from '../../core/model/entities/hn-base.entity';
import { HnBrickMajorVersion } from '../brick-major-version/hn-brick-major-version.entity';
import { HnDocumentation } from '../documentation/hn-documentation.entity';

@Entity('folder')
@Tree('materialized-path')
export class HnFolder extends HnBaseEntity {
  @Column({ nullable: true })
  title: string;

  @BlNotUpdatable()
  @ManyToOne(() => HnBrickMajorVersion, { eager: true, onDelete: 'CASCADE' })
  brickMajorVersion: HnBrickMajorVersion;

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: true })
  completePath: string;

  @Column()
  order: number;

  @TreeParent({ onDelete: 'CASCADE' })
  folder: HnFolder;

  @TreeChildren()
  folders: HnFolder[];

  @OneToMany(() => HnDocumentation, (doc) => doc.folder)
  documentations: HnDocumentation[];

  nextOrder(): number {
    let maxOrder: number = 0;
    if (this.folders != null) {
      this.folders.map((f) => {
        if (f.order >= maxOrder) {
          maxOrder = f.order + 1;
        }
      });
    }
    if (this.documentations != null) {
      this.documentations.map((d) => {
        if (d.order >= maxOrder) {
          maxOrder = d.order + 1;
        }
      });
    }
    return maxOrder;
  }
}
