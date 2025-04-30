import { HnBrickVersion, HnVersionType } from './hn-brick-version.entity';
import { HnBaseDto } from '../../core/model/entities/hn-base.dto';
import { HnBrickMajorVersionDTO } from '../brick-major-version/hn-brick-major-version.dto';

export class HnBrickVersionDto extends HnBaseDto {
  minor: number;
  patch: number;
  subPatch?: number;
  versionType: HnVersionType;
  repoType: string;
  brickMajorVersion: HnBrickMajorVersionDTO;
  technicalInfo?: Record<string, any>;

  constructor(brickVersion: HnBrickVersion) {
    super(brickVersion);
    this.minor = brickVersion.minor;
    this.patch = brickVersion.patch;
    this.subPatch = brickVersion.subPatch;
    this.versionType = brickVersion.versionType;
    this.repoType = brickVersion.repoType;
    this.brickMajorVersion = new HnBrickMajorVersionDTO(brickVersion.brickMajorVersion);
    this.technicalInfo = brickVersion.technicalInfo;
  }
}
