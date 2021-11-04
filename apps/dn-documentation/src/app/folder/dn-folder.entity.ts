import { BlEntityWithId } from '@monorepo/back-core-lib';
import {Column, Entity, ManyToOne, OneToMany, TreeChildren, TreeParent, Unique, JoinColumn, Tree} from 'typeorm';
import {DnVersion} from '../version/dn-version.entity';
import {DnDocumentation} from '../documentation/dn-documentation.entity';

@Unique('', ['folder', 'order'])
@Entity('Folder')
@Tree('materialized-path')
export class DnFolder extends BlEntityWithId{

  @Column()
  title: string;

  @ManyToOne(() => DnVersion, {eager: true})
  version: DnVersion;

  @Column()
  path: string;

  @Column()
  order: number;

  @TreeParent()
  folder: DnFolder;

  @TreeChildren()
  folders: DnFolder[];

  @OneToMany(() => DnDocumentation, doc => doc.folder)
  documentations: DnDocumentation[];
}

export class DnFolderDTO extends BlEntityWithId{

  title: string;

  path: string;

  order: number;

  folder: DnFolder;

  folders: DnFolder[];

  documentations: DnDocumentation[];
}

export class DnFolderResDTO extends BlEntityWithId{

  title: string;

  path: string;

  order: number;

  folderId: string;
}

export class DnNode{
  name: string;

  order: number;

  children?: DnNode[];

  constructor(n: string, o: number, c?: DnNode[]) {
    this.name = n;
    this.order = o;
    if(c){
      this.children = c;
    }
  }
}
