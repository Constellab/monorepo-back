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

export class DnNode extends  BlEntityWithId{
  name: string;

  order: number;

  path: string;

  children?: DnNode[];

  constructor(i: string, n: string, p: string, o: number, c?: DnNode[]) {
    super();
    this.id = i;
    this.name = n;
    this.order = o;
    this.path = p;
    if(c){
      this.children = c;
    }
  }
}
