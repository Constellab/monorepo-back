import {BlEntityWithId} from '@monorepo/back-core-lib';
import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {DnVersion} from '../version/dn-version.entity';
import {doc} from 'prettier';

@Unique('', ['path', 'version'])
@Entity('Documentation')
export class DnDocumentation extends BlEntityWithId {

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => DnVersion)
  version: DnVersion;

  @Column()
  path: string;

  @Column()
  order: number;
}

export class DnDocumentationDTO extends BlEntityWithId {
  title: string;

  path: string;

  order:number;

  asChild: boolean;

  childs: DnDocumentationDTO[];

  constructor(documentation: DnDocumentation) {
    super();
    this.path = documentation.path;
    this.title = documentation.title;
    this.id = documentation.id;
    this.order = documentation.order;
    this.asChild = false;
    this.childs = null;
  }
}
