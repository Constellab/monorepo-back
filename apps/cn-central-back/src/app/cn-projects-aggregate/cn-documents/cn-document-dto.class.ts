import {CnDocument} from './cn-document.entity';
import {Type} from 'class-transformer';
import {BlRichTextI} from '@monorepo/back-core-lib';


export class CnConstellabDocument {
  @Type(() => CnDocument)
  document: CnDocument;

  content: BlRichTextI;

  constructor(document: CnDocument, content: BlRichTextI) {
    this.document = document;
    this.content = content;
  }
}
