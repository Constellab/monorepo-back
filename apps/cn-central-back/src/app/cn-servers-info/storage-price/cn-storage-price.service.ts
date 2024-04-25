import {Injectable} from '@nestjs/common';
import {BlAbstractService, BlBadRequestException} from '@monorepo/back-core-lib';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, IsNull, LessThanOrEqual, MoreThan, Repository} from 'typeorm';
import {ClDateHelper} from '@monorepo/core-lib';
import {CnStoragePrice} from './cn-storage-price.entity';
import {CnCreateStoragePriceDTO} from './cn-storage-price.dto';


@Injectable()
export class CnStoragePriceService extends BlAbstractService<CnStoragePrice> {

  constructor(@InjectRepository(CnStoragePrice) private repository: Repository<CnStoragePrice>,
              private datasource: DataSource) {
    super(repository, CnStoragePrice);
  }


  public async getCurrentStoragePrice(): Promise<CnStoragePrice | null> {
    const currentDate = ClDateHelper.getDate();
    return this.repository.findOne({
      where: [
        {
          startDate: LessThanOrEqual(currentDate.toISO()),
          endDate: IsNull()
        },
        {
          startDate: LessThanOrEqual(currentDate.toISO()),
          endDate: MoreThan(currentDate.toISODate())
        }
      ]
    });
  }

  public async getAndCheckCurrentStoragePrice(): Promise<CnStoragePrice> {
    const price = await this.getCurrentStoragePrice();
    if (!price) {
      throw new BlBadRequestException('Could not find the current storage price.');
    }

    return price;
  }

  private async getLastPrice(): Promise<CnStoragePrice | null> {
    return this.repository.findOne({
      where: {
        endDate: IsNull()
      },
    });
  }

  /**
   * Save a new price after the last one.
   */
  public async createPrice(newPrice: CnCreateStoragePriceDTO): Promise<CnStoragePrice> {
    const lastPrice = await this.getLastPrice();

    if (!lastPrice) {
      throw new BlBadRequestException('No price found.');
    }

    if (newPrice.price === lastPrice.price) {
      throw new BlBadRequestException('The new price is the same as the last price.');
    }

    if (newPrice.startDate < lastPrice.startDate) {
      throw new BlBadRequestException('The new price start date must be after the last price start date.');
    }

    const newStoragePrice = new CnStoragePrice();
    newStoragePrice.price = newPrice.price;
    newStoragePrice.startDate = newPrice.startDate;

    return this.datasource.transaction(async entityManager => {
      // end the current price
      lastPrice.endDate = newPrice.startDate;
      await this.update(lastPrice, entityManager);

      // create the new price
      return this.create(newStoragePrice, entityManager);
    });
  }

  public async deletePrice(priceId: string): Promise<void> {
    const price = await this.findByIdAndCheck(priceId);

    const storagePrices = await this.findAll('ASC');
    if (storagePrices.length <= 1) {
      throw new BlBadRequestException('Cannot delete the last price.');
    }

    const priceIndex = storagePrices.findIndex(p => p.id === priceId);


    if (priceIndex === 0) {
      const nextPrice = storagePrices[priceIndex + 1];
      nextPrice.startDate = price.startDate;
      await this.datasource.transaction(async entityManager => {
        await this.update(nextPrice, entityManager);
        await this.deleteById(priceId, entityManager);
      });
      return;
    }

    const previousPrice = storagePrices[priceIndex - 1];
    previousPrice.endDate = price.endDate;

    await this.datasource.transaction(async entityManager => {
      await this.update(previousPrice, entityManager);
      await this.deleteById(priceId, entityManager);
    });
  }

  public async findAll(order: 'ASC' | 'DESC'): Promise<CnStoragePrice[]> {
    return this.repository.find({
      order: {
        startDate: order as any
      }
    });
  }


}
