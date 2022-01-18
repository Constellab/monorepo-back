import {Column, Entity, ManyToOne, OneToMany, Tree, TreeChildren, TreeParent, Unique} from 'typeorm';
import {HnDocumentation} from '../documentation/hn-documentation.entity';
import {HnBaseEntity} from '../core/model/entities/hn-base.entity';
import {HnBrickVersion} from '../brick-version/hn-brick-version.entity';
import {BlEntityWithId, BlNotUpdatable} from '@monorepo/back-core-lib';

@Unique(['folder', 'order'])
@Entity('Folder')
@Tree('materialized-path')
export class HnFolder extends HnBaseEntity {

  @Column({nullable: true})
  title: string;

  @BlNotUpdatable()
  @ManyToOne(() => HnBrickVersion, {eager: true})
  brickVersion: HnBrickVersion;

  @Column({nullable: true})
  path: string;

  @Column({nullable: true})
  completePath: string;

  @Column()
  order: number;

  @TreeParent()
  folder: HnFolder;

  @TreeChildren()
  folders: HnFolder[];

  @OneToMany(() => HnDocumentation, doc => doc.folder)
  documentations: HnDocumentation[];

  nextOrder(): number{
    let maxOrder:number = 0;
    console.log(this.folders, this.documentations);
    if(typeof this.folders !== 'undefined'){
      this.folders.map(f => {
        if(f.order >= maxOrder){
          maxOrder = f.order+1;
        }
      });
    }
    if(typeof this.documentations !== 'undefined'){
      this.documentations.map(d => {
        if(d.order >= maxOrder){
          maxOrder = d.order+1;
        }
      });
    }
    return maxOrder;
  }
}

export class HnFolderResDTO extends HnBaseEntity {

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

export class HnNode extends HnBaseEntity {
  name: string;

  order: number;

  path: string;

  completePath: string;

  parentId: string;

  children?: HnNode[];

  constructor(id: string, name: string, path: string, completePath: string, o: number, children?: HnNode[], parentId?: string) {
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

export class HnNodeDTO extends BlEntityWithId{
  title: string;
  path: string;
  folderId?: string;
  isFolder: boolean;
  order?: number;


}
