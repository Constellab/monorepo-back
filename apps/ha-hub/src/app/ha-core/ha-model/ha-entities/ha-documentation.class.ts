import {HaEntity} from './ha-entity.class';
import {HaFolder} from './ha-folder.class';

export class HaDocumentation extends HaEntity {

  title: string;

  content: Record<string, any>;

  path: string;

  completePath: string;

  folder: HaFolder;

  folderId: string;

  versionId: string;

  order: number;
}

export class HaDocumentationDTO extends HaEntity {
  title: string;

  completePath: string;
}

export class HaDocumentationFormDTO extends HaEntity {
  title: string;

  content: Record<string, any>;

  folderId: string;

  path: string;

  order: number;
}

export class HaDocumentationContentFormDTO extends HaEntity {
  content: Record<string, any>;
}
