import {CaBaseEntity} from '../ca-base-entity.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';


export class CaDocument extends CaBaseEntity {
  name: string;

  filePath: string;

  size: number;

  mimeType: string;

  projectId: string;
}

export type CaDocumentDatasource = FlDatasourcePaginated<CaDocument>;
