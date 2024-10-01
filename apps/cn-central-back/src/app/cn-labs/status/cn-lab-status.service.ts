import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CnLabStatusHistory } from './cn-lab-status-history.entity';
import { cnLabRunningStatuses } from './cn-lab-status.enum';
import { DateTime } from 'luxon';
import { ClDateHelper, ClPageI } from '@monorepo/core-lib';
import {
  CnLabRunningStatus,
  CnLabRunningStatusBilling,
  CnLabStatusRunRequest,
  CnLabStatusRunResponse
} from './cn-lab-status.dto';
import { CnServerPrices } from '../../cn-servers-info/server-price/cn-server-price.dto';
import { BlAbstractPaginatedService, BlSearchBuilder, BlSearchParams } from '@monorepo/back-core-lib';


@Injectable()
export class CnLabStatusService extends BlAbstractPaginatedService<CnLabStatusHistory> {

  constructor(@InjectRepository(CnLabStatusHistory) repo: Repository<CnLabStatusHistory>) {
    super(repo, CnLabStatusHistory);
  }

  public async getLabRunningKpisWithBilling(labId: string,
                                            request: CnLabStatusRunRequest,
                                            serverPrices?: CnServerPrices): Promise<CnLabStatusRunResponse> {
    const runStatus = await this.getLabRunningKpis(labId, request);

    if (serverPrices) {

      const totalBillInfo = new CnLabRunningStatusBilling();
      totalBillInfo.nbOfHours = 0;
      totalBillInfo.pricePerHour = 0;
      totalBillInfo.totalPrice = 0;

      for (const status of runStatus.statuses) {
        const billInfo = new CnLabRunningStatusBilling();
        // round status.duration to the next hour
        billInfo.nbOfHours = Math.ceil(status.duration / 3600);
        billInfo.pricePerHour = serverPrices.getPriceAt(status.fromDate);
        billInfo.totalPrice = billInfo.pricePerHour * billInfo.nbOfHours;

        status.billInfo = billInfo;

        totalBillInfo.totalPrice += billInfo.totalPrice;
        totalBillInfo.nbOfHours += billInfo.nbOfHours;
      }

      runStatus.billInfo = totalBillInfo;
    }

    return runStatus;
  }

  /**
   * Return the duration of the lab running during a period in seconds
   * @param labId
   * @param request
   */
  public async getLabRunningKpis(labId: string,
                                 request: CnLabStatusRunRequest): Promise<CnLabStatusRunResponse> {
    const statusHistory = await this.repo.find({
      where: {
        entity: { id: labId }
      },
      order: {
        createdAt: 'ASC' as any
      }
    });

    return this.getRunningStatus(statusHistory, request);
  }

  private getLabRunPeriod(request: CnLabStatusRunRequest): { startDate: DateTime, endDate: DateTime } {
    const now = ClDateHelper.getDate();
    let startDate: DateTime;
    let endDate: DateTime;
    switch (request.period) {
      case 'CURRENT_MONTH':
        startDate = ClDateHelper.getDate().startOf('month');
        endDate = now;
        break;
      case 'CURRENT_YEAR':
        startDate = ClDateHelper.getDate().startOf('year');
        endDate = now;
        break;
      case 'LAST_7_DAYS':
        startDate = ClDateHelper.getDate().minus({ days: 7 }).endOf('day');
        endDate = now;
        break;
      case 'LAST_30_DAYS':
        startDate = ClDateHelper.getDate().minus({ days: 30 }).endOf('day');
        endDate = now;
        break;
      case 'LAST_365_DAYS':
        startDate = ClDateHelper.getDate().minus({ days: 365 }).endOf('day');
        endDate = now;
        break;
      case 'ALL':
        startDate = ClDateHelper.getDate('1900-01-01').startOf('day');
        endDate = now;
        break;
      case 'CUSTOM':
        startDate = request.customStartDate ? ClDateHelper.getDate(request.customStartDate).startOf('day') :
          ClDateHelper.getDate('1900-01-01').startOf('day');
        endDate = request.customEndDate ? ClDateHelper.getDate(request.customEndDate).endOf('day') : now;
        break;
    }
    if (endDate > now) {
      endDate = now;
    }
    return { startDate, endDate };
  }

  /**
   * Return a resume of the running status of a lab during a period, including total running duration
   * @param statusList full list of status history
   * @param request request
   * @private
   */
  private getRunningStatus(statusList: CnLabStatusHistory[],
                           request: CnLabStatusRunRequest): CnLabStatusRunResponse {
    const { startDate, endDate } = this.getLabRunPeriod(request);

    let cumulativeDuration = 0;
    const runningStatuses: CnLabRunningStatus[] = [];
    let currentRunningStatus: CnLabRunningStatus = null;

    for (const status of statusList) {
      // if this is a stop status
      if (!cnLabRunningStatuses.includes(status.status)) {
        // save the running status if exists
        if (currentRunningStatus) {
          currentRunningStatus.setToDate(status.createdAt);
          runningStatuses.push(currentRunningStatus);
          currentRunningStatus = null;
        }
        continue;
      }

      let newRunningDate: DateTime;

      // if the status has started before date and finish during dates
      if (status.startedBefore(startDate) && status.endDate >= startDate && !status.endsAfter(endDate)) {
        // add duration between startDate and end of status
        cumulativeDuration += status.endDate.diff(startDate, 'seconds').seconds;
        newRunningDate = startDate;
        // if the status has started before date and finish after end date
      } else if (status.startedBefore(startDate) && status.endsAfter(endDate)) {
        // add duration between startDate and endDate
        cumulativeDuration += endDate.diff(startDate, 'seconds').seconds;
        newRunningDate = startDate;
        // if the status has started during dates and finish during dates
      } else if (status.startedBetween(startDate, endDate) && !status.endsAfter(endDate)) {
        // add duration between status start and end
        cumulativeDuration += status.getDurationInSeconds();
        newRunningDate = status.createdAt;
        // if the status has started during dates and finish after end date
      } else if (status.startedBetween(startDate, endDate) && status.endsAfter(endDate)) {
        // add duration between status start and endDate
        cumulativeDuration += endDate.diff(status.createdAt, 'seconds').seconds;
        newRunningDate = status.createdAt;
      }

      // if the status is running
      if (!currentRunningStatus && newRunningDate) {
        currentRunningStatus = new CnLabRunningStatus();
        currentRunningStatus.fromDate = newRunningDate;
        currentRunningStatus.user = status.createdBy;
      }

      // if the status ends after endDate, no need to continue
      if (status.endsAfter(endDate)) {
        break;
      }
    }

    if (currentRunningStatus) {
      currentRunningStatus.setToDate(endDate);
      runningStatuses.push(currentRunningStatus);
    }

    const response = new CnLabStatusRunResponse();
    response.period = request.period;
    response.fromDate = startDate;
    response.toDate = endDate;
    response.runningDuration = cumulativeDuration;
    response.statuses = runningStatuses.reverse();

    return response;
  }

  /**
   * Get the histories of status paginated for an entity
   * @param page page number
   * @param size size of the page
   * @param id id of the entity
   * @param searchParams
   * @return the list of status history
   */
  public getStatusHistoryPaginated(page: number,
                                   size: number,
                                   id: string,
                                   searchParams: BlSearchParams): Promise<ClPageI<CnLabStatusHistory>> {

    const searchBuilder = new BlSearchBuilder<CnLabStatusHistory>({
      createdAt: 'DESC' as any
    });
    searchBuilder.addSearchParams(searchParams);
    searchBuilder.mergeWhereOptions({ entity: { id } });

    return this.findPaginated(page, size, searchBuilder.build());
  }
}
