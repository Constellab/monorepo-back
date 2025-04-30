import { HnBaseDto } from '../../core/model/entities/hn-base.dto';
import { HnDocumentation } from './hn-documentation.entity';
import { TeRichTextDTO } from '@monorepo/te-text-editor';

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
