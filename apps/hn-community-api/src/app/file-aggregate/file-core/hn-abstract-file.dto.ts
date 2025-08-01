import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';
import { TeBlockFileUploadResponse } from '@monorepo/te-text-editor';

import { HnUserDto } from '../../users/hn-user.dto';
import { HnAbstractFileEntity, HnFileType } from './hn-abstract-file.entity';

export class HnUploadFileResponseDto extends BlEntityWithIdDTO implements TeBlockFileUploadResponse {
  name: string;
  size: number;
}

export class HnAbstractFileEntityDTO {
  type: HnFileType;

  name: string;

  createdAt: string;

  createdBy: HnUserDto;

  size?: number;

  constructor(fileEntity: HnAbstractFileEntity<any>) {
    this.type = fileEntity.type;
    this.name = fileEntity.name;
    this.createdAt = fileEntity.createdAt.toISO();
    this.createdBy = new HnUserDto(fileEntity.createdBy);
    this.size = fileEntity.size;
  }
}
