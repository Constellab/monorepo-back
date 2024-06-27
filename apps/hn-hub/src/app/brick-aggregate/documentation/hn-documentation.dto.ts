import {HnBaseDto} from '../../core/model/entities/hn-base.dto';
import {HnFolderDto} from '../folder/hn-folder.dto';
import {HnDocumentation} from './hn-documentation.entity';
import {HnFileDocumentation} from '../../file-aggregate/file-documentation/hn-file-documentation.entity';

export class HnDocumentationDto extends HnBaseDto{
  title: string;
  content?: Record<string, any>;
  path: string;
  completePath: string;
  order: number;
  folder: HnFolderDto;
  docFiles: HnFileDocumentation[];

  constructor(documentation: HnDocumentation) {
    super(documentation);
    this.title = documentation.title;
    this.content = documentation.content;
    this.path = documentation.path;
    this.completePath = documentation.completePath;
    this.order = documentation.order;
    this.folder = new HnFolderDto(documentation.folder);
    this.docFiles = documentation.docFiles;
  }
}
