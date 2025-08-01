import { ClDateHelper, ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { Expose, Type } from 'class-transformer';
import { DateTime } from 'luxon';

import { CnLabVolumeType } from '../volume/cn-lab-volume-entity';

/**
 * Object representing a period, subclasses store additional data for the period
 */
export abstract class CnLabStorageStatsPeriod {
  @ClLuxonDateTimeTransform()
  fromDate: DateTime;
  @ClLuxonDateTimeTransform()
  toDate: DateTime;

  protected constructor(fromDate: DateTime, toDate: DateTime) {
    this.fromDate = fromDate;
    this.toDate = toDate;
  }

  getToDateWithDefault(): DateTime {
    return this.toDate ?? ClDateHelper.getDate('9999-12-31');
  }

  @Expose()
  get durationInHour(): number {
    return Math.ceil(this.toDate.diff(this.fromDate, 'seconds').seconds / 3600);
  }

  /**
   * Method to check if the period can be merged with another one
   * It can if the additional data between the two periods are the same
   * @param otherPeriod
   */
  abstract canBeMerged(otherPeriod: this): boolean;
}

export class CnLabStorageStatsPeriodNumber extends CnLabStorageStatsPeriod {
  data: number;

  constructor(fromDate: DateTime, toDate: DateTime, data: number) {
    super(fromDate, toDate);
    this.data = data;
  }

  canBeMerged(otherPeriod: CnLabStorageStatsPeriodNumber): boolean {
    return this.data === otherPeriod.data;
  }
}

/**
 * Object to manage multiple periods
 */
export class CnLabStorageStatsPeriods<T extends CnLabStorageStatsPeriod = CnLabStorageStatsPeriod> {
  periods: T[] = [];

  public addPeriod(period: T): void {
    const lastPeriod = this.periods[this.periods.length - 1];

    // TODO : this might be improved. The period which starts the hour is considered as the period of the hour
    // if the next period has an higher pricing, the hour will be billed to the previous period (which might not be the best)
    // we need to round the hours to avoid counting twice the same hour due to the ceil (round to the next hour)
    if (lastPeriod) {
      period.fromDate = lastPeriod.toDate;
    } else {
      // round fromDate to the start of the hour
      period.fromDate = period.fromDate.startOf('hour');
    }

    // if the toDate is not rounded, we need to round it
    if (period.toDate && (period.toDate.minute !== 0 || period.toDate.second !== 0)) {
      // round toDate to the start of the next hour
      period.toDate = period.toDate.startOf('hour').plus({ hours: 1 });
    }

    // if it has the same data as the last one, we can merge them
    if (lastPeriod && lastPeriod.canBeMerged(period)) {
      lastPeriod.toDate = period.toDate;
      return;
    }

    this.periods.push(period);
  }
}

export class CnLabStorageStatsPeriodVolumeDTO extends CnLabStorageStatsPeriod {
  // in GB
  volumeSize: number;

  volumeType: CnLabVolumeType;

  volumePricePerGBPerHour: number;

  constructor(
    fromDate: DateTime,
    toDate: DateTime,
    volumeSize: number,
    volumeType: CnLabVolumeType,
    volumePricePerGBPerHour: number
  ) {
    super(fromDate, toDate);
    this.volumeSize = volumeSize;
    this.volumeType = volumeType;
    this.volumePricePerGBPerHour = volumePricePerGBPerHour;
  }

  canBeMerged(periodPrice: CnLabStorageStatsPeriodVolumeDTO): boolean {
    return (
      this.volumeSize === periodPrice.volumeSize &&
      this.volumeType === periodPrice.volumeType &&
      this.volumePricePerGBPerHour === periodPrice.volumePricePerGBPerHour
    );
  }

  @Expose()
  get volumePrice(): number {
    return this.volumeSize * this.volumePricePerGBPerHour * this.durationInHour;
  }
}

export class CnLabStorageStatsPeriodBackupDTO extends CnLabStorageStatsPeriod {
  // in bytes
  backupSize: number;

  // in GB/hour
  backupPricePerGBPerHour: number;

  constructor(fromDate: DateTime, toDate: DateTime, backupSize: number, backupPricePerGBPerHour: number) {
    super(fromDate, toDate);
    this.backupSize = backupSize;
    this.backupPricePerGBPerHour = backupPricePerGBPerHour;
  }

  canBeMerged(periodPrice: CnLabStorageStatsPeriodBackupDTO): boolean {
    return (
      this.backupSize === periodPrice.backupSize &&
      this.backupPricePerGBPerHour === periodPrice.backupPricePerGBPerHour
    );
  }

  @Expose()
  get backupPrice(): number {
    return (this.backupSize / 1024 / 1024 / 1024) * this.backupPricePerGBPerHour * this.durationInHour;
  }
}

export class CnLabStatsStorageResponseDTO {
  @ClLuxonDateTimeTransform()
  fromDate: DateTime;
  @ClLuxonDateTimeTransform()
  toDate: DateTime;

  totalVolumePrice: number = 0;
  totalVolumeNbOfHours: number = 0;

  totalBackupStoragePrice: number = 0;
  totalBackupStorageNbOfHours: number = 0;

  totalBackupTransferredData: number = 0;
  totalBackupTransferredDataPrice: number = 0;

  @Type(() => CnLabStorageStatsPeriodVolumeDTO)
  volumes: CnLabStorageStatsPeriodVolumeDTO[] = [];

  @Type(() => CnLabStorageStatsPeriodBackupDTO)
  backupStorages: CnLabStorageStatsPeriodBackupDTO[] = [];

  constructor(fromDate: DateTime, toDate: DateTime) {
    this.fromDate = fromDate;
    this.toDate = toDate;
  }

  public addVolume(volume: CnLabStorageStatsPeriodVolumeDTO): void {
    this.volumes.push(volume);
    this.totalVolumePrice += volume.volumePrice;
    this.totalVolumeNbOfHours += volume.durationInHour;
  }

  public addBackup(backup: CnLabStorageStatsPeriodBackupDTO): void {
    this.backupStorages.push(backup);
    this.totalBackupStoragePrice += backup.backupPrice;
    this.totalBackupStorageNbOfHours += backup.durationInHour;
  }

  public addTransferredData(dataInBytes: number, pricePerGB: number): void {
    const transferredDataPrice = (dataInBytes / 1024 / 1024 / 1024) * pricePerGB;
    this.totalBackupTransferredData += dataInBytes;
    this.totalBackupTransferredDataPrice += transferredDataPrice;
  }

  public dateIsBetween(date: DateTime): boolean {
    return this.fromDate <= date && this.toDate > date;
  }
}
