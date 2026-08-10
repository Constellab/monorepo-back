import { BlAbstractPaginatedService, BlSearchBuilder, BlSearchParams } from '@monorepo/back-core-lib';
import { ClPageI } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CnLabStatus } from './cn-lab-status.enum';
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
   * Whether the lab ever reached a status, over its whole history.
   *
   * A count rather than a look through a page of history: "has this lab ever run?" is the
   * question that tells a first start apart from a regression, and the answer for an old lab
   * is older than any page a caller would read.
   */
  public async hasEverHadStatus(labId: string, status: CnLabStatus): Promise<boolean> {
    const count = await this.repo.countBy({ entity: { id: labId }, status });
    return count > 0;
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
