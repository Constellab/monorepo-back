import { BlAbstractService, BlBadRequestException } from '@monorepo/back-core-lib';
import { ClDateHelper } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, LessThanOrEqual, MoreThan, Repository } from 'typeorm';

import { CnServerStandard } from '../server-standard/cn-server-standard.entity';
import { CnCreateServerPriceDTO, CnServerPrices } from './cn-server-price.dto';
import { CnServerPrice } from './cn-server-price.entity';

@Injectable()
export class CnServerPriceService extends BlAbstractService<CnServerPrice> {
  constructor(
    @InjectRepository(CnServerPrice) private repository: Repository<CnServerPrice>,
    private datasource: DataSource
  ) {
    super(repository, CnServerPrice);
  }

  public async getServerAllPrices(
    serverStandardId: string,
    direction: 'ASC' | 'DESC'
  ): Promise<CnServerPrices> {
    const prices = await this.repository.find({
      where: {
        serverStandard: {
          id: serverStandardId,
        },
      },
      order: {
        startDate: direction as any,
      },
    });

    return new CnServerPrices(prices);
  }

  public async getServerCurrentPrice(serverStandardId: string): Promise<CnServerPrice | null> {
    const currentDate = ClDateHelper.getDate();
    return this.repository.findOne({
      where: [
        {
          serverStandard: {
            id: serverStandardId,
          },
          startDate: LessThanOrEqual(currentDate.toISO()),
          endDate: IsNull(),
        },
        {
          serverStandard: {
            id: serverStandardId,
          },
          startDate: LessThanOrEqual(currentDate.toISO()),
          endDate: MoreThan(currentDate.toISODate()),
        },
      ],
    });
  }

  public async getAndCheckServerCurrentPrice(serverStandardId: string): Promise<CnServerPrice> {
    const price = await this.getServerCurrentPrice(serverStandardId);
    if (!price) {
      throw new BlBadRequestException('Could not find the current price for the server.');
    }

    return price;
  }

  private async getLastPrice(serverStandardId: string): Promise<CnServerPrice | null> {
    return this.repository.findOne({
      where: {
        serverStandard: {
          id: serverStandardId,
        },
        endDate: IsNull(),
      },
    });
  }

  public async createFirstPrice(
    serverStandard: CnServerStandard,
    newPrice: number,
    entityManager: EntityManager
  ): Promise<CnServerPrice> {
    const newServerPrice = new CnServerPrice();
    newServerPrice.price = newPrice;
    newServerPrice.startDate = ClDateHelper.getDate();
    newServerPrice.serverStandard = serverStandard;

    return entityManager.save(newServerPrice);
  }

  /**
   * Save a new price after the last one.
   */
  public async createPrice(
    serverStandard: CnServerStandard,
    newPrice: CnCreateServerPriceDTO
  ): Promise<CnServerPrice> {
    const lastPrice = await this.getLastPrice(serverStandard.id);

    if (!lastPrice) {
      throw new BlBadRequestException('No price found for the server.');
    }

    if (newPrice.price === lastPrice.price) {
      throw new BlBadRequestException('The new price is the same as the last price.');
    }

    if (newPrice.startDate < lastPrice.startDate) {
      throw new BlBadRequestException('The new price start date must be after the last price start date.');
    }

    const newServerPrice = new CnServerPrice();
    newServerPrice.price = newPrice.price;
    newServerPrice.startDate = newPrice.startDate;
    newServerPrice.serverStandard = serverStandard;

    return this.datasource.transaction(async (entityManager) => {
      // end the current price
      lastPrice.endDate = newPrice.startDate;
      await this.update(lastPrice, entityManager);

      // create the new price
      return this.create(newServerPrice, entityManager);
    });
  }

  public async deletePrice(serverStandardId: string, priceId: string): Promise<void> {
    const price = await this.findByIdAndCheck(priceId, { serverStandard: true });

    if (price.serverStandard.id !== serverStandardId) {
      throw new BlBadRequestException('The price does not belong to the server.');
    }

    const serverPrices = await this.getServerAllPrices(serverStandardId, 'ASC');

    if (serverPrices.prices.length <= 1) {
      throw new BlBadRequestException('Cannot delete the last price.');
    }

    const priceIndex = serverPrices.prices.findIndex((p) => p.id === priceId);

    if (priceIndex === 0) {
      const nextPrice = serverPrices.prices[priceIndex + 1];
      nextPrice.startDate = price.startDate;
      await this.datasource.transaction(async (entityManager) => {
        await this.update(nextPrice, entityManager);
        await this.deleteById(priceId, entityManager);
      });
      return;
    }

    const previousPrice = serverPrices.prices[priceIndex - 1];
    previousPrice.endDate = price.endDate;

    await this.datasource.transaction(async (entityManager) => {
      await this.update(previousPrice, entityManager);
      await this.deleteById(priceId, entityManager);
    });
  }

  public async deleteByServerStandard(serverStandardId: string, entityManager: EntityManager): Promise<void> {
    await entityManager.delete(CnServerPrice, {
      serverStandard: {
        id: serverStandardId,
      },
    });
  }
}
