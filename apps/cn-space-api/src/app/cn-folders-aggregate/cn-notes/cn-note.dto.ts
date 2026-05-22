import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { TeRichTextBlockModificationsDTO, TeRichTextInput } from '@monorepo/te-text-editor';
import { Type } from 'class-transformer';
import { DateTime } from 'luxon';

import { CnLabConfigDto } from '../../cn-lab-configs/cn-lab-config.dto';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { CnNote } from './cn-note.entity';

export class CnSaveNoteDto {
  id: string;
  title: string;
  content: TeRichTextInput;

  modifications?: TeRichTextBlockModificationsDTO;

  is_validated: boolean;

  @Type(() => CnUserEntity)
  validated_by?: CnUser;

  @ClLuxonDateTimeTransform()
  validated_at?: DateTime;

  @Type(() => CnUserEntity)
  last_sync_by?: CnUser;

  @ClLuxonDateTimeTransform()
  last_sync_at?: DateTime;

  @ClLuxonDateTimeTransform()
  created_at: DateTime;

  @Type(() => CnUserEntity)
  created_by: CnUser;

  @ClLuxonDateTimeTransform()
  last_modified_at: DateTime;

  @Type(() => CnUserEntity)
  last_modified_by: CnUser;
}

export class CnCreateNoteWithConfigDto {
  @Type(() => CnSaveNoteDto)
  note: CnSaveNoteDto;
  lab_config: CnLabConfigDto;
  scenario_ids: string[];
}

export interface CnSaveNoteResultDTO {
  mode: 'create' | 'update';
  note: CnNote;
}
