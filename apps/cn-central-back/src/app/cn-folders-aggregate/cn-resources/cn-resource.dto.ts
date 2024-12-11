import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';
import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';

export class CnShareResourceRequestDTO {
  resource_id: string;
  name: string;
  typing_name: string;
  style: CnTypeStyle;
  share_link: string;

  @ClLuxonDateTimeTransform()
  valid_until?: DateTime;
}
