import {HnBaseDto} from '../../core/model/entities/hn-base.dto';
import {HnDocumentation} from './hn-documentation.entity';

export class HnDocumentationDto extends HnBaseDto{
  title: string;
  content?: Record<string, any>;
  path: string;
  completePath: string;
  order: number;

  constructor(documentation: HnDocumentation) {
    super(documentation);
    this.title = documentation.title;
    this.content = documentation.content;
    this.path = documentation.path;
    this.completePath = documentation.completePath;
    this.order = documentation.order;
  }
}
