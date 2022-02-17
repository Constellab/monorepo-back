import {CnBrickVersion} from '../cn-bricks/cn-brick-version.entity';
import {Type} from 'class-transformer';


export class CnSaveLabFrontVersionDTO {
  version: string;

  @Type(() => CnBrickVersion)
  gwsCoreBrickVersion: CnBrickVersion;
}
