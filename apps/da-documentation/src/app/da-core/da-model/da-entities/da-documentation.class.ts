import {DaEntity} from './da-entity.class';

export class DaDocumentation extends DaEntity {

  title: string;

  content: string;

  path: string;

  versionId: string;

  order: number;
}

export class DaDocumentationDTO extends DaEntity {
  title: string;

  path: string;

  order: number;

  asChild: boolean;

  childs: DaDocumentationDTO[];

  toggleChild: boolean;
}
