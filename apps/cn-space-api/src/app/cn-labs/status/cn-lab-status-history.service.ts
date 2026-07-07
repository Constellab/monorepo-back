import { BlAbstractPaginatedService, BlSearchBuilder, BlSearchParams } from '@monorepo/back-core-lib';
import { ClPageI } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CnLabStatusHistory } from './cn-lab-status-history.entity';

@Injectable()
export class CnLabStatusHistoryService extends BlAbstractPaginatedService<CnLabStatusHistory> {
  constructor(@InjectRepository(CnLabStatusHistory) repo: Repository<CnLabStatusHistory>) {
    super(repo, CnLabStatusHistory);
  }

  /**
   * Get the histories of status paginated for an entity
   * @param page page number
   * @param size size of the page
   * @param id id of the entity
   * @param searchParams
   * @return the list of status history
   */
  public getStatusHistoryPaginated(
    page: number,
    size: number,
    id: string,
    searchParams: BlSearchParams
  ): Promise<ClPageI<CnLabStatusHistory>> {
    const searchBuilder = new BlSearchBuilder<CnLabStatusHistory>({
      createdAt: 'DESC',
    });
    searchBuilder.addSearchParams(searchParams);
    searchBuilder.mergeWhereOptions({ entity: { id } });

    return this.findPaginated(page, size, searchBuilder.build());
  }

  /**
   * Return the status history of a lab
   * @param labId
   */
  public async getAllStatusHistory(labId: string): Promise<CnLabStatusHistory[]> {
    return this.repo.find({
      where: {
        entity: { id: labId },
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  /**
   * Method to retrieve the list of users that manipulated the lab status
   */
  public async getUsersOfStatusHistory(labId: string): Promise<string[]> {
    const users: any[] = await this.repo
      .createQueryBuilder()
      .select('DISTINCT created_by_id')
      .where('entity_id = :labId', { labId })
      .orderBy('created_at', 'DESC')
      .getRawMany();

    return users.map((user) => user.createdById);
  }
}
