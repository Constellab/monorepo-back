import {Injectable} from '@nestjs/common';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnServerInfoPrice} from './cn-server-info-price.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, IsNull, LessThanOrEqual, Repository} from 'typeorm';
import {ClDateHelper} from '@monorepo/core-lib';
import {CnServerInfo} from '../server-info/cn-server-info.entity';
import {CnServerPrices} from './cn-server-prices.class';


@Injectable()
export class CnServerInfoPriceService extends BlAbstractService<CnServerInfoPrice> {

  constructor(@InjectRepository(CnServerInfoPrice) private repository: Repository<CnServerInfoPrice>,
              private datasource: DataSource) {
    super(repository, CnServerInfoPrice);
  }

  public async getServerAllPrices(serverInfoId: string): Promise<CnServerPrices> {
    const prices = await this.repository.find({
      where: {
        serverInfo: {
          id: serverInfoId
        }
      },
      order: {
        startDate: 'ASC' as any
      }
    });

    return new CnServerPrices(prices);
  }

  public async getServerCurrentPrice(serverInfoId: string): Promise<CnServerInfoPrice | null> {
    const currentDate = ClDateHelper.getDate();
    return this.repository.findOne({
      where: {
        serverInfo: {
          id: serverInfoId
        },
        startDate: LessThanOrEqual(currentDate.toISODate()),
        endDate: IsNull()
      }
    });
  }

  public async getAndCheckServerCurrentPrice(serverInfoId: string): Promise<CnServerInfoPrice | null> {
    const price = await this.getServerCurrentPrice(serverInfoId);
    if (!price) {
      throw new Error('Could not find the current price for the server.');
    }

    return price;
  }

  public async updatePrice(serverInfo: CnServerInfo, newPrice: number): Promise<CnServerInfoPrice> {
    const currentPrice = await this.getServerCurrentPrice(serverInfo.id);

    const newServerPrice = new CnServerInfoPrice();
    newServerPrice.price = newPrice;
    newServerPrice.startDate = ClDateHelper.getDate();
    newServerPrice.serverInfo = serverInfo;

    if (!currentPrice) {
      return this.repository.save(newServerPrice);
    }

    if (currentPrice.price === newPrice) {
      return currentPrice;
    }

    return this.datasource.transaction(async (entityManager) => {
      // end the current price
      currentPrice.endDate = ClDateHelper.getDate();
      await this.update(currentPrice, entityManager);

      // create the new price
      return this.create(newServerPrice);
    });
  }

  public createDefaultPrice(serverInfo: CnServerInfo): Promise<CnServerInfoPrice> {
    const newServerPrice = new CnServerInfoPrice();
    newServerPrice.price = 3.14;
    newServerPrice.startDate = ClDateHelper.getDate('1900-01-01');
    newServerPrice.serverInfo = serverInfo;

    return this.create(newServerPrice);
  }
}
