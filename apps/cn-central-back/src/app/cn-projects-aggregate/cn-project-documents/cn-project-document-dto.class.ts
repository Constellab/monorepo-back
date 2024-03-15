import {Type} from 'class-transformer';
import {BlRichTextContent} from '@monorepo/back-core-lib';
import {CnProjectDocument} from './cn-project-document.entity';

export class CnConstellabDocument2 {
  @Type(() => CnProjectDocument)
  document: CnProjectDocument;

  content: BlRichTextContent;

  constructor(document: CnProjectDocument, content: BlRichTextContent) {
    this.document = document;
    this.content = content;
  }
}
