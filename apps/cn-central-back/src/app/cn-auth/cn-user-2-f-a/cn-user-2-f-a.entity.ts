import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BlEntityWithId, BlLuxonDateTimeColumn } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { ClDateHelper } from '@monorepo/core-lib';
import { Type } from 'class-transformer';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';

/**
 * Table to store the codes of the user 2 factor authentication
 */
@Unique(['user'])
@Unique(['urlCode'])
@Entity('user_2_fa')
export class CnUser2FA extends BlEntityWithId {
  private static readonly VALIDITY_DURATION = ClDateHelper.ONE_MINUTE * 5;

  @BlLuxonDateTimeColumn({ nullable: false, update: false })
  createdAt: DateTime;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { nullable: false })
  user: CnUser;

  // code received by email
  @Column({ length: 10, nullable: false })
  twoFACode: string;

  // code accessible from the navigator, generated on login
  @Column({ length: 36, nullable: false })
  urlCode: string;

  public isValid(): boolean {
    return (
      this.createdAt.plus({ milliseconds: CnUser2FA.VALIDITY_DURATION }).toMillis() >
      ClDateHelper.getDate().toMillis()
    );
  }
}
