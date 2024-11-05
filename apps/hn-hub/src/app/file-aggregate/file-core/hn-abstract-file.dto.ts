import { BlEntityWithIdDTO, BlRichTextUploadFileResponse } from '@monorepo/back-core-lib';
import { HnAbstractFileEntity, HnFileType } from './hn-abstract-file.entity';
import { HnUserDto } from '../../users/hn-user.dto';

export class HnUploadFileResponseDto extends BlEntityWithIdDTO implements BlRichTextUploadFileResponse {
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
