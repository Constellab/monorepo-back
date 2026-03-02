import { HnUser } from '../users/hn-user.entity';
import { HnCliAuthCodeStatus } from './hn-cli-auth.enum';

export class HnCliAuthCode {
  code: string;
  status: HnCliAuthCodeStatus;
  createdAt: number;
  validatedAt?: number;
  user?: HnUser;
}
