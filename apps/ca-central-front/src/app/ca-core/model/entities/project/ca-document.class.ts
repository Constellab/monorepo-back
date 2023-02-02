import {CaBaseEntity} from '../ca-base-entity.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {CmRichTextI} from '@monorepo/common-model';


export class CaDocument extends CaBaseEntity {
  name: string;

  size: number;

  mimeType: string;

  projectId: string;

  isConstellabDocument: boolean;
}

export type CaDocumentDatasource = FlDatasourcePaginated<CaDocument>;


export class CaConstellabDocument {

  @Type(() => CaDocument)
  document: CaDocument;

  content: CmRichTextI;
}
