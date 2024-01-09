import {CnDocument} from './cn-document.entity';
import {Type} from 'class-transformer';
import {BlRichTextContent} from '@monorepo/back-core-lib';


export class CnConstellabDocument {
  @Type(() => CnDocument)
  document: CnDocument;

  content: BlRichTextContent;

  constructor(document: CnDocument, content: BlRichTextContent) {
    this.document = document;
    this.content = content;
  }
}
