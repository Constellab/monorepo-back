import {CnBrickVersionDto} from '../cn-bricks/cn-brick.dto';

export class CnLabConfigDto {
  version: number;
  brick_versions: CnBrickVersionDto[];
}
