import {Column, Entity, ManyToOne} from 'typeorm';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnDocumentation} from '../documentation/hn-documentation.entity';

@Entity('documentation_file')
export class HnDocumentationFile extends BlEntityWithId {

  @Column()
  humanName: string;

  @Column()
  fileName: string;

  @ManyToOne(() => HnDocumentation, documentation => documentation.docFiles, {nullable: false})
  documentation: HnDocumentation;

  initFile(documentation: HnDocumentation, humanName: string, fileName: string): void {
    this.documentation = documentation;
    this.humanName = humanName;
    this.fileName = fileName;
  }
}
