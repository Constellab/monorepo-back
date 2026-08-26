import { BlBadRequestException } from '@monorepo/back-core-lib';
import { DateTime } from 'luxon';

import { CnStoragePrice } from '../../cn-servers-info/storage-price/cn-storage-price.entity';
import { CnLabBackupStatus } from '../backup/cn-lab-backup.dto';
import { CnLabBackupHistory } from '../backup/cn-lab-backup-history.entity';
import { CnLabVolume } from '../volume/cn-lab-volume-entity';
import { CnLabStatsRequestDTO } from './cn-lab-stats.dto';
import {
  CnLabStatsStorageResponseDTO,
  CnLabStorageStatsPeriod,
  CnLabStorageStatsPeriodBackupDTO,
  CnLabStorageStatsPeriodNumber,
  CnLabStorageStatsPeriods,
  CnLabStorageStatsPeriodVolumeDTO,
} from './cn-lab-storage-stats.dto';

export class CnLabStatsStorage {
  private readonly stats: CnLabStatsStorageResponseDTO;

  private readonly labBackups: CnLabBackupHistory[];

  constructor(
    private storagePrices: CnStoragePrice[],
    private labVolumes: CnLabVolume[],
    labBackups: CnLabBackupHistory[],
    request: CnLabStatsRequestDTO
  ) {
    // we have to filter the backups to keep only the success and deleted backups
    this.labBackups = labBackups.filter(
      (backup) => backup.status === CnLabBackupStatus.SUCCESS || backup.status === CnLabBackupStatus.DELETED
    );
    this.stats = new CnLabStatsStorageResponseDTO(request.getStartDate(), request.getEndDate());
  }

  public getStorageStats(): CnLabStatsStorageResponseDTO {
    // handle the volumes
    this.calculateVolumeStats();

    // handle the backups
    this.calculateBackupStorageStats();
    this.calculateBackupTransferStats();

    return this.stats;
  }

  private calculateVolumeStats(): void {
    const volumePeriods = this.getLabVolumeAsPeriods();
    const pricePeriods = this.getStoragePriceAsPeriods(
      (storagePrice: CnStoragePrice) => storagePrice.volumePricePerHour
    );

    const volumePricePeriods = this.mergePeriodsWithPrice(
      volumePeriods,
      pricePeriods,
      (pricePeriod, otherPeriod) =>
        new CnLabStorageStatsPeriodVolumeDTO(
          pricePeriod.fromDate,
          pricePeriod.toDate,
          otherPeriod.volumeSize,
          otherPeriod.volumeType,
          pricePeriod.data
        )
    );

    for (const volumePeriod of volumePricePeriods) {
      this.stats.addVolume(volumePeriod);
    }
  }

  private getLabVolumeAsPeriods(): CnLabStorageStatsPeriodVolumeDTO[] {
    const periodPrices = new CnLabStorageStatsPeriods<CnLabStorageStatsPeriodVolumeDTO>();

    for (const volume of this.labVolumes) {
      periodPrices.addPeriod(
        new CnLabStorageStatsPeriodVolumeDTO(
          volume.startDate,
          volume.getEndDateWithDefault(),
          volume.size,
          volume.type,
          0
        )
      );
    }

    return periodPrices.periods;
  }

  private calculateBackupStorageStats(): void {
    const backupPeriods = this.getBackupsAsPeriods();
    const pricePeriods = this.getStoragePriceAsPeriods(
      (storagePrice: CnStoragePrice) => storagePrice.backupPricePerHour
    );

    const backupPricePeriods = this.mergePeriodsWithPrice(
      backupPeriods,
      pricePeriods,
      (pricePeriod, otherPeriod) =>
        new CnLabStorageStatsPeriodBackupDTO(
          pricePeriod.fromDate,
          pricePeriod.toDate,
          otherPeriod.data,
          pricePeriod.data
        )
    );

    for (const backupPeriod of backupPricePeriods) {
      this.stats.addBackup(backupPeriod);
    }
  }

  private calculateBackupTransferStats(): void {
    // calculate the total transferred data
    for (const backup of this.labBackups) {
      if (!this.stats.dateIsBetween(backup.startedAt)) continue;
      // skip backups that are not finished yet (no end date)
      const backupEndedAt = backup.endedAt;
      if (backupEndedAt == null) continue;

      //calculate the storage transfer price for the backup
      const storagePrice = this.storagePrices.find((price) => price.dateIsBetween(backupEndedAt));
      if (!storagePrice) {
        throw new BlBadRequestException(
          'No storage price found for the backup dates, please contact the support'
        );
      }
      this.stats.addTransferredData(backup.getTransferSize(), storagePrice.backupTransfertPrice);
    }
  }

  /**
   * Merge the storage prices periods with the other periods to return a list of periods with the price.
   * The return periods starts at this.stats.fromDate and ends at this.stats.toDate.
   * The returns periods are the intersection of the input periods and the storage prices periods,
   * new periods are create if the storage price change during the period.
   * @param periods periods to merge with the storage prices
   * @param storagePrices storage prices to merge with the periods
   * @param periodFactory factory to create the new period with the price
   * @private
   */
  private mergePeriodsWithPrice<T extends CnLabStorageStatsPeriod, H extends CnLabStorageStatsPeriod>(
    periods: H[],
    storagePrices: CnLabStorageStatsPeriodNumber[],
    periodFactory: (pricePeriod: CnLabStorageStatsPeriodNumber, otherPeriod: H) => T
  ): T[] {
    const periodPrices: CnLabStorageStatsPeriods<T> = new CnLabStorageStatsPeriods();

    for (const period of periods) {
      // we have to skip the storage price if it ends before the start of the period
      if (period.getToDateWithDefault() < this.stats.fromDate) continue;
      // we have to stop the loop if the storage price starts after the end of the period
      if (period.fromDate > this.stats.toDate) break;

      const startDate = period.fromDate < this.stats.fromDate ? this.stats.fromDate : period.fromDate;
      const endDate =
        period.getToDateWithDefault() > this.stats.toDate ? this.stats.toDate : period.getToDateWithDefault();

      const filteredPrices = this.getStoragePricePeriodsAt(storagePrices, startDate, endDate);
      for (const price of filteredPrices) {
        const newPeriod = periodFactory(price, period);
        periodPrices.addPeriod(newPeriod);
      }
    }

    return periodPrices.periods;
  }

  private getBackupsAsPeriods(): CnLabStorageStatsPeriodNumber[] {
    const periodPrices = new CnLabStorageStatsPeriods<CnLabStorageStatsPeriodNumber>();

    let previousBackup: CnLabBackupHistory | null = null;

    for (const backup of this.labBackups) {
      if (!previousBackup) {
        previousBackup = backup;
        continue;
      }

      periodPrices.addPeriod(
        new CnLabStorageStatsPeriodNumber(
          previousBackup.startedAt,
          backup.startedAt,
          previousBackup.getTotalSize()
        )
      );
      previousBackup = backup;
    }

    // add the last period
    if (previousBackup) {
      periodPrices.addPeriod(
        new CnLabStorageStatsPeriodNumber(previousBackup.startedAt, null, previousBackup.getTotalSize())
      );
    }

    return periodPrices.periods;
  }

  /**
   * Filter the input storage prices to keep only the prices that are in the period
   * The returns periods start at startDate and end at endDate.
   * If multiple prices are in the period, it returns multiple periods
   * @param storagePrices
   * @param startDate
   * @param endDate
   * @private
   */
  private getStoragePricePeriodsAt(
    storagePrices: CnLabStorageStatsPeriodNumber[],
    startDate: DateTime,
    endDate: DateTime
  ): CnLabStorageStatsPeriodNumber[] {
    const periodPrices: CnLabStorageStatsPeriods<CnLabStorageStatsPeriodNumber> =
      new CnLabStorageStatsPeriods();
    for (const storagePrice of storagePrices) {
      // we have to skip the storage price if it ends before the start of the period
      if (storagePrice.getToDateWithDefault() < startDate) continue;
      // we have to stop the loop if the storage price starts after the end of the period
      if (storagePrice.fromDate > endDate) break;

      const clipped = this.clipStoragePriceToPeriod(storagePrice, startDate, endDate);
      if (clipped.period) {
        periodPrices.addPeriod(clipped.period);
      }
      // a storage price that covers the end of the period leaves nothing for the next ones
      if (clipped.reachesEndOfPeriod) break;
    }

    return periodPrices.periods;
  }

  /**
   * The part of one storage price that falls inside the period, if any, and whether it reaches
   * the end of the period
   * @param storagePrice
   * @param startDate
   * @param endDate
   * @private
   */
  private clipStoragePriceToPeriod(
    storagePrice: CnLabStorageStatsPeriodNumber,
    startDate: DateTime,
    endDate: DateTime
  ): { period: CnLabStorageStatsPeriodNumber | null; reachesEndOfPeriod: boolean } {
    // if a storage price include the full period
    if (storagePrice.fromDate <= startDate && storagePrice.getToDateWithDefault() >= endDate) {
      return {
        period: new CnLabStorageStatsPeriodNumber(startDate, endDate, storagePrice.data),
        reachesEndOfPeriod: true,
      };
      // if a storage price starts before the period and finis                      h before the end
    } else if (storagePrice.fromDate <= startDate && storagePrice.getToDateWithDefault() < endDate) {
      return {
        period: new CnLabStorageStatsPeriodNumber(startDate, storagePrice.toDate, storagePrice.data),
        reachesEndOfPeriod: false,
      };
      // if a storage price starts after the start and after the period
    } else if (storagePrice.fromDate >= startDate && storagePrice.getToDateWithDefault() > endDate) {
      return {
        period: new CnLabStorageStatsPeriodNumber(storagePrice.fromDate, endDate, storagePrice.data),
        reachesEndOfPeriod: true,
      };
      // if a storage price starts after the start and finish before the end (inside the period)
    } else if (storagePrice.fromDate > startDate && storagePrice.getToDateWithDefault() < endDate) {
      return {
        period: new CnLabStorageStatsPeriodNumber(
          storagePrice.fromDate,
          storagePrice.toDate,
          storagePrice.data
        ),
        reachesEndOfPeriod: false,
      };
    }

    return { period: null, reachesEndOfPeriod: false };
  }

  private getStoragePriceAsPeriods(
    extractData: (storagePrice: CnStoragePrice) => number
  ): CnLabStorageStatsPeriodNumber[] {
    const periodPrices = new CnLabStorageStatsPeriods<CnLabStorageStatsPeriodNumber>();

    for (const storagePrice of this.storagePrices) {
      periodPrices.addPeriod(
        new CnLabStorageStatsPeriodNumber(
          storagePrice.startDate,
          storagePrice.endDate ?? null,
          extractData(storagePrice)
        )
      );
    }

    return periodPrices.periods;
  }
}
