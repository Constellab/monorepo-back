import { HnBaseDto } from '../core/model/entities/hn-base.dto';
import { HnBrickMajorVersionDTO } from '../brick-aggregate/brick-major-version/hn-brick-major-version.dto';
import { HnTechnicalFolder } from './hn-technical-folder.entity';

export class HnTechnicalFolderDto extends HnBaseDto {
  brickMajorVersion: HnBrickMajorVersionDTO;

  constructor(technicalFolder: HnTechnicalFolder) {
    super(technicalFolder);
    this.brickMajorVersion = new HnBrickMajorVersionDTO(technicalFolder.brickMajorVersion);
  }
}
