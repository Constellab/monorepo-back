import {DaEntity} from './da-entity.class';
import {DaFolder} from './da-folder.class';

export class DaDocumentation extends DaEntity {

  title: string;

  content: string;

  path: string;

  completePath: string;

  folder: DaFolder;

  folderId: string;

  versionId: string;

  order: number;
}

export class DaDocumentationDTO extends DaEntity {
  title: string;

  completePath: string;
}

export class DaDocumentationFormDTO extends DaEntity {
  title: string;

  content: string;

  folderId: string;

  path: string;

  order: number;
}
