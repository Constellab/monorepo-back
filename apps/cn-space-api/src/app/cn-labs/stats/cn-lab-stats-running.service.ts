import { CnServerPrices } from '../../cn-servers-info/server-price/cn-server-price.dto';
import { cnLabRunningStatuses } from '../status/cn-lab-status.enum';
import { CnLabStatusHistory } from '../status/cn-lab-status-history.entity';
import {
  CnLabStatsRunningBillingDTO,
  CnLabStatsRunningResponseDTO,
  CnLabStatsRunningStatusDTO,
} from './cn-lab-running-stats.dto';
import { CnLabStatsRequestDTO } from './cn-lab-stats.dto';

export class CnLabStatsRunningService {
  constructor(
    private request: CnLabStatsRequestDTO,
    private statusHistories: CnLabStatusHistory[]
  ) {}

  public async getLabRunningKpisWithBilling(
    serverPrices: CnServerPrices
  ): Promise<CnLabStatsRunningResponseDTO> {
    const runStatus = this.getRunningStatus();
    const totalBillInfo = new CnLabStatsRunningBillingDTO(0, 0);

    for (const status of runStatus.statuses) {
      // round status.duration to the next hour
      const billInfo = new CnLabStatsRunningBillingDTO(
        Math.ceil(status.duration / 3600),
        serverPrices.getPriceAt(status.fromDate)
      );

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

    let runningStatuses: CnLabStatsRunningStatusDTO[] = [];
    let currentRunningStatus: CnLabStatsRunningStatusDTO = null;

    for (const status of this.statusHistories) {
      // if the status ends before startDate, no need to check it, it is before the period
      if (!status.endsAfter(startDate)) continue;

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

      // if we reach here, the status is a running status
      // if there is no current running status, we create one
      if (!currentRunningStatus) {
        currentRunningStatus = new CnLabStatsRunningStatusDTO();
        // if the status has started before date and finish during dates
        if (status.startedBefore(startDate)) {
          currentRunningStatus.fromDate = startDate;
          // if the status has started during dates and finish during dates
        } else {
          currentRunningStatus.fromDate = status.createdAt;
        }
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

    // filter the statuses by users
    if (this.request.hasUsersFilter()) {
      runningStatuses = runningStatuses.filter((status) =>
        this.request.users.find((requestUser) => requestUser.id === status.user.id)
      );
    }

    return new CnLabStatsRunningResponseDTO(startDate, endDate, runningStatuses.reverse());
  }
}
