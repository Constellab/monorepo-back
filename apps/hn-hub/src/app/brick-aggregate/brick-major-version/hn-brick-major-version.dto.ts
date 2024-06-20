import {HnBaseDto} from '../../core/model/entities/hn-base.dto';
import {HnBrickDto} from '../brick/hn-brick.dto';
import {HnBrickMajorVersion, HnVersionState} from './hn-brick-major-version.entity';

export class HnBrickMajorVersionDTO extends HnBaseDto{
  brick: HnBrickDto;
  major: number;
  versionState: HnVersionState;

  constructor(brickMajorVersion: HnBrickMajorVersion) {
    super(brickMajorVersion);
    this.brick = new HnBrickDto(brickMajorVersion.brick);
    this.major = brickMajorVersion.major;
    this.versionState = brickMajorVersion.versionState;
  }
}
