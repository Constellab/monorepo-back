import {HaEntity} from './ha-entity.class';
import {CmRichTextI} from '@monorepo/common-model';

export class HaDocumentation extends HaEntity {

  title: string;

  content: CmRichTextI;

  path: string;

  completePath: string;

  folderId: string;

  versionId: string;

  order: number;
}

export class HaTechnicalDocumentation extends HaEntity{
  uniqueName: string;
  humanName: string;
  shortDescription: string;
  doc: string;
  brickName: string;
  parentUniqueName: string;
  parentBrickName: string;
  parentMajorVersion: number;
  parentHumanName: string;
  parentVersion: string;
  resourceType: string;
}

export class HaDocumentationDTO extends HaEntity {
  title: string;

  completePath: string;
}

export class HaDocumentationFormDTO extends HaEntity {
  title: string;

  content: CmRichTextI;

  folderId: string;

  path: string;

  order: number;
}

export class HaDocumentationContentFormDTO extends HaEntity {
  content: CmRichTextI;
}
