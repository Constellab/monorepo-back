import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {BlLuxonDateTimeColumn, BlNotUpdatable} from '@monorepo/back-core-lib';
import {DateTime} from 'luxon';
import {Exclude, Type} from 'class-transformer';
import {CnUser} from '../../cn-users/cn-user.entity';
import {Column, Entity, ManyToOne} from 'typeorm';
import {CnLabDomain, CnLabInstance, CnLabInstanceBillingMode, CnLabInstanceVolumeType} from '../cn-lab-instance.entity';
import {ClDateHelper} from '@monorepo/core-lib';
import {CnCloudProviderName} from '../../cn-cloud-providers/cn-cloud-provider.entity';
import {CnBrickGWS} from '../../cn-bricks/cn-brick.dto';
import {CnLabGreenOptionType} from '../green-option/cn-lab-green-option.entity';

/**
 * Entity to store the free trials for a lab instance for a user
 */
@Entity('lab_free_trial')
export class CnLabFreeTrial extends CnBaseEntity {

  // SERVER INFO
  public static readonly CLOUD_PROVIDER: CnCloudProviderName = 'AZURE';
  public static readonly CLOUD_PROVIDER_REGION = 'northeurope';
  public static readonly CLOUD_PROVIDER_INSTANCE_TYPE = 'Standard_B4ms';
  public static readonly VOLUME_SIZE = 100;
  public static readonly VOLUME_TYPE = CnLabInstanceVolumeType.HIGH_SPEED;
  public static readonly BILLING_MODE = CnLabInstanceBillingMode.HOURLY;
  public static readonly DOMAIN = CnLabDomain.CONSTELLAB_APP;

  // CONFIG
  public static readonly BRICKS = [CnBrickGWS.GWS_CORE, CnBrickGWS.GWS_ACADEMY];

  // TIME LIMITE
  public static readonly HOUR_LIMIT = 10;
  public static readonly EXPIRATION_DAYS = 7;
  // delete completely the lab 2 days after the expiration
  public static readonly DELETION_AFTER_DAYS = 2;

  // GREEN OPTION, stop lab after 30 minutes of inactivity
  public static readonly GREEN_OPTION_TYPE: CnLabGreenOptionType = CnLabGreenOptionType.STOP_AFTER_INACTIVITY_TIME;
  public static readonly GREEN_OPTION_INACTIVITY_DURATION: number = 30;


  @Type(() => CnUser)
  @ManyToOne(() => CnUser, {eager: true, nullable: false})
  @BlNotUpdatable()
  @Exclude()
  user: CnUser;

  @Type(() => CnLabInstance)
  @ManyToOne(() => CnLabInstance, {eager: true, nullable: true, onDelete: 'SET NULL'})
  @BlNotUpdatable()
  @Exclude()
  labInstance?: CnLabInstance;

  @Column({nullable: true})
  labInstanceId?: string;

  @Column({nullable: false})
  usageLimitInHours: number;

  @BlLuxonDateTimeColumn({nullable: false})
  expirationDate: DateTime;

  isExpired(): boolean {
    return this.expirationDate < ClDateHelper.getDate();
  }

  getDeletionDate(): DateTime {
    return this.expirationDate.plus({days: CnLabFreeTrial.DELETION_AFTER_DAYS});
  }

  toDelete(): boolean {
    return this.getDeletionDate() < ClDateHelper.getDate();
  }

}
