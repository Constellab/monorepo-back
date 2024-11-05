import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnDocumentationDto } from '../documentation/hn-documentation.dto';
import { HnDocumentationFile } from './hn-documentation-file.entity';

export class HnDocumentationFileDto extends BlEntityWithId {
  humanName: string;
  fileName: string;
  documentation: HnDocumentationDto;

  constructor(documentationFile: HnDocumentationFile) {
    super();
    this.id = documentationFile.id;
    this.humanName = documentationFile.humanName;
    this.fileName = documentationFile.fileName;
    this.documentation = new HnDocumentationDto(documentationFile.documentation);
  }
}
