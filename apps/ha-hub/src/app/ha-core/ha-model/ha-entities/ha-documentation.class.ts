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


export class HaDocumentationContentFormDTO extends HaEntity {
  content: CmRichTextI;
}

export interface HaDocumentationSearchDTO {
  id?: string;
  name: string;
  completePath?: string;
  anchor?: string;
  brickName?: string;
  major?: string;
  isTechnical?: boolean;
}
