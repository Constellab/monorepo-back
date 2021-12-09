import {Column, Entity, ManyToOne, OneToMany, Tree, TreeChildren, TreeParent, Unique} from 'typeorm';
import {DnDocumentation} from '../documentation/dn-documentation.entity';
import {DnBaseEntity} from '../core/model/entities/dn-base.entity';
import {DnBrickVersion} from '../brick-version/dn-brick-version.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Unique(['folder', 'order'])
@Entity('Folder')
@Tree('materialized-path')
export class DnFolder extends DnBaseEntity {

  @Column({nullable: true})
  title: string;

  @BlNotUpdatable()
  @ManyToOne(() => DnBrickVersion, {eager: true})
  brickVersion: DnBrickVersion;

  @Column({nullable: true})
  path: string;

  @Column({nullable: true})
  completePath: string;

  @Column()
  order: number;

  @TreeParent()
  folder: DnFolder;

  @TreeChildren()
  folders: DnFolder[];

  @OneToMany(() => DnDocumentation, doc => doc.folder)
  documentations: DnDocumentation[];
}

export class DnFolderResDTO extends DnBaseEntity {

  title: string;

  path: string;

  order: number;

  folderId: string;

  constructor(title: string, path: string, order: number, folderId: string) {
    super();
    this.title = title;
    this.path = path;
    this.order = order;
    this.folderId = folderId
  }
}

export class DnNode extends DnBaseEntity {
  name: string;

  order: number;

  path: string;

  completePath: string;

  parentId: string;

  children?: DnNode[];

  constructor(id: string, name: string, path: string, completePath: string, o: number, children?: DnNode[], parentId?: string) {
    super();
    this.id = id;
    this.name = name;
    this.order = o;
    this.path = path;
    if (parentId)
      this.parentId = parentId;
    this.completePath = completePath;
    if (children) {
      this.children = children;
    }
  }
}
