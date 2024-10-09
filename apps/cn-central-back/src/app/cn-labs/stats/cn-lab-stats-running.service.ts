import { CnLabStatusHistory } from '../status/cn-lab-status-history.entity';
import { cnLabRunningStatuses } from '../status/cn-lab-status.enum';
import { DateTime } from 'luxon';
import { CnLabStatsRequestDTO } from './cn-lab-stats.dto';
import { CnServerPrices } from '../../cn-servers-info/server-price/cn-server-price.dto';
import {
  CnLabStatsRunningBillingDTO,
  CnLabStatsRunningResponseDTO,
  CnLabStatsRunningStatusDTO
} from './cn-lab-running-stats.dto';


export class CnLabStatsRunningService {

  constructor(private request: CnLabStatsRequestDTO,
              private statusHistories: CnLabStatusHistory[]) {
  }

  public async getLabRunningKpisWithBilling(serverPrices: CnServerPrices): Promise<CnLabStatsRunningResponseDTO> {
    const runStatus = this.getRunningStatus();

    const totalBillInfo = new CnLabStatsRunningBillingDTO(0, 0);

    for (const status of runStatus.statuses) {
      // round status.duration to the next hour
      const billInfo = new CnLabStatsRunningBillingDTO(Math.ceil(status.duration / 3600),
        serverPrices.getPriceAt(status.fromDate));

      status.billInfo = billInfo;

      totalBillInfo.totalPrice += billInfo.totalPrice;
      totalBillInfo.nbOfHours += billInfo.nbOfHours;
    }

    runStatus.billInfo = totalBillInfo;

    return runStatus;
  }

  /**
   * Return a resume of the running status of a lab during a period, including total running duration
   * @private
   */
  public getRunningStatus(): CnLabStatsRunningResponseDTO {
    const startDate = this.request.getStartDate();
    const endDate = this.request.getEndDate();

    let cumulativeDuration = 0;
    const runningStatuses: CnLabStatsRunningStatusDTO[] = [];
    let currentRunningStatus: CnLabStatsRunningStatusDTO = null;

    for (const status of this.statusHistories) {
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
        currentRunningStatus = new CnLabStatsRunningStatusDTO();
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

    const response = new CnLabStatsRunningResponseDTO();
    response.fromDate = startDate;
    response.toDate = endDate;
    response.runningDuration = cumulativeDuration;
    response.statuses = runningStatuses.reverse();

    return response;
  }
}
