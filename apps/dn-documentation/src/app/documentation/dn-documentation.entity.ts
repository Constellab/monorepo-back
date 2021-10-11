import { BlEntityWithId } from '@monorepo/back-core-lib';
import { Column, Entity, ManyToOne } from 'typeorm';
import { DnVersion } from '../version/dn-version.entity';

@Entity('Documentation')
export class DnDocumentation extends BlEntityWithId{

    @Column()
    title: string;

    @Column('text')
    content: string;

    @ManyToOne(() => DnVersion)
    version: DnVersion;

    @Column()
    path: string;
}

export class DnDocumentationDTO extends BlEntityWithId{
  title: string;

  path:string;

  constructor(documentation: DnDocumentation) {
    super();
    this.path = documentation.path;
    this.title = documentation.title;
    this.id = documentation.id;
  }
}
