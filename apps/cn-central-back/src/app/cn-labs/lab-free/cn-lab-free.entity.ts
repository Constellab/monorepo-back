import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';
import { Exclude, Type } from 'class-transformer';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CnLabBillingMode, CnLabDomain, CnLabEntity } from '../cn-lab.entity';
import { ClDateHelper } from '@monorepo/core-lib';
import { CnCloudProviderName } from '../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnBrickGWS } from '../../cn-bricks/cn-brick.dto';
import { CnLabVolumeType } from '../volume/cn-lab-volume-entity';

/**
 * Entity to store the free lab info for a lab for a user
 */
@Entity('lab_free')
export class CnLabFree extends CnBaseEntity {

  // SERVER INFO
  public static readonly CLOUD_PROVIDER: CnCloudProviderName = 'AZURE';
  public static readonly CLOUD_PROVIDER_REGION = 'northeurope';
  public static readonly CLOUD_PROVIDER_INSTANCE_TYPE = 'Standard_D2s_v5';
  public static readonly NB_CPUS = 2;
  public static readonly RAM_SIZE = 8;
  public static readonly VOLUME_SIZE = 250;
  public static readonly VOLUME_TYPE = CnLabVolumeType.HIGH_SPEED;
  public static readonly BILLING_MODE = CnLabBillingMode.HOURLY;
  public static readonly DOMAIN = CnLabDomain.CONSTELLAB_APP;

  // CONFIG
  public static readonly BRICKS = [CnBrickGWS.GWS_CORE, CnBrickGWS.GWS_ACADEMY];

  // TIME LIMITE PER MONTH
  public static readonly HOUR_LIMIT = 25;
  // delete completely the lab 2 days after the expiration
  public static readonly DELETION_AFTER_DAYS = 2;

  @Type(() => CnUserEntity)
  @ManyToOne(() => CnUserEntity, { eager: true, nullable: false })
  @BlNotUpdatable()
  @Exclude()
  user: CnUser;

  @Type(() => CnLabEntity)
  @ManyToOne(() => CnLabEntity, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @BlNotUpdatable()
  @Exclude()
  lab?: CnLabEntity;

  @Column({ nullable: true })
  labId?: string;

  // the number of hours the user can use the lab per month
  @Column({ nullable: false })
  usageLimitInHours: number;

  @BlLuxonDateTimeColumn({ nullable: true })
  expirationDate?: DateTime;

  isExpired(): boolean {
    if (!this.expirationDate) return false;
    return this.expirationDate < ClDateHelper.getDate();
  }

  getDeletionDate(): DateTime | null {
    if (!this.expirationDate) return null;
    return this.expirationDate.plus({ days: CnLabFree.DELETION_AFTER_DAYS });
  }

  toDelete(): boolean {
    const deletionDate = this.getDeletionDate();
    if (!deletionDate) return false;
    return deletionDate < ClDateHelper.getDate();
  }

}
