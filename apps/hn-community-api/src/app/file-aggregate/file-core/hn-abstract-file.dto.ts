import { BlEntityWithIdDTO } from '@monorepo/back-core-lib';
import { TeBlockFileUploadResponse } from '@monorepo/te-text-editor';

import { HnUserDto } from '../../users/hn-user.dto';
import { HnAbstractFileEntity, HnFileType } from './hn-abstract-file.entity';

export class HnUploadFileResponseDto extends BlEntityWithIdDTO implements TeBlockFileUploadResponse {
  name!: string;
  size!: number;
}

export class HnAbstractFileEntityDTO {
  type: HnFileType;

  name: string;

  createdAt: string | null;

  createdBy: HnUserDto | null;

  size?: number | null;

  constructor(fileEntity: HnAbstractFileEntity<any>) {
    this.type = fileEntity.type;
    this.name = fileEntity.name;
    this.createdAt = fileEntity.createdAt.toISO();
    this.createdBy = fileEntity.createdBy ? new HnUserDto(fileEntity.createdBy) : null;
    this.size = fileEntity.size;
  }
}
