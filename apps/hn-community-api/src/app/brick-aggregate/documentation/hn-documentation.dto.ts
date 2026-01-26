import { TeRichTextDTO } from '@monorepo/te-text-editor';

import { HnBaseDto } from '../../core/model/entities/hn-base.dto';
import { HnDocumentation } from './hn-documentation.entity';

export class HnDocumentationDto extends HnBaseDto {
  title: string;
  content: TeRichTextDTO;
  path: string;
  completePath: string;
  order: number;

  constructor(documentation: HnDocumentation) {
    super(documentation);
    this.title = documentation.title;
    this.content = documentation.getRichText().toJson();
    this.path = documentation.path;
    this.completePath = documentation.completePath;
    this.order = documentation.order;
  }
}

export class HnDocumentationShortDto extends HnBaseDto {
  title: string;
  path: string;
  completePath: string;
  order: number;

  constructor(documentation: HnDocumentation) {
    super(documentation);
    this.title = documentation.title;
    this.path = documentation.path;
    this.completePath = documentation.completePath;
    this.order = documentation.order;
  }
}
