import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnTechnicalFolderDto} from '../../../technical-folder/hn-technical-folder.dto';

export abstract class HnGeneratedDocDto extends BlEntityWithId {
  brickName: string;
  brickMajor: number;
  uniqueName: string;
  humanName: string;
  doc: string;
  technicalFolder?: HnTechnicalFolderDto;
}
