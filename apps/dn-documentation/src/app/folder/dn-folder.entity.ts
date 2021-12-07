import { BlEntityWithId } from '@monorepo/back-core-lib';
import {Column, Entity, ManyToOne, OneToMany, TreeChildren, TreeParent, Unique, Tree} from 'typeorm';
import {DnVersion} from '../version/dn-version.entity';
import {DnDocumentation} from '../documentation/dn-documentation.entity';
import {DnBaseEntity} from '../core/model/entities/dn-base.entity';

@Unique('', ['folder', 'order'])
@Entity('Folder')
@Tree('materialized-path')
export class DnFolder extends DnBaseEntity{

  @Column()
  title: string;

  @ManyToOne(() => DnVersion, {eager: true})
  version: DnVersion;

  @Column()
  path: string;

  @Column()
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

export class DnFolderResDTO extends DnBaseEntity{

  title: string;

  path: string;

  order: number;

  folderId: string;
}

export class DnNode extends  DnBaseEntity{
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
    if(parentId)
      this.parentId = parentId;
    this.completePath = completePath;
    if(children){
      this.children = children;
    }
  }
}
