import {CnDocument} from './cn-document.entity';
import {CmRichTextI} from '@monorepo/common-model';
import {Type} from 'class-transformer';


export class CnConstellabDocument{
  @Type(() => CnDocument)
  document: CnDocument;

  content: CmRichTextI;

  constructor(document: CnDocument, content: CmRichTextI) {
    this.document = document;
    this.content = content;
  }
}
