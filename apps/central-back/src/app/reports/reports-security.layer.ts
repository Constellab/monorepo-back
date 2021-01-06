import {Injectable} from '@nestjs/common';
import {AbstractSecurityLayer} from '../core/class/abstract-security.layer';
import {Report} from './report.entity';
import {RefuseAuthorization} from '../core/security/refuse.authorization';
import {ReportsService} from './reports.service';
import {ExperimentsSecurityLayer} from '../experiments/experiments-security-layer.service';

@Injectable()
export class ReportsSecurityLayer extends AbstractSecurityLayer<Report> {

  constructor(private service: ReportsService,
              private experimentSecurityLayer: ExperimentsSecurityLayer) {
    super(service);
  }

  // not used
  async isAuthorizedToCreate(newEntity: Report): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(dbEntity: Report): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: Report): Promise<boolean> {
    return this.experimentSecurityLayer.isAuthorizedToFindById(dbEntity.experimentId);
  }

  async isAuthorizedToUpdate(dbEntity: Report): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  // todo add security
  async createReport(report: Report, experimentId: string): Promise<Report> {
    report.experiment = await this.experimentSecurityLayer.findByIdAndCheck(experimentId);

    return this.service.create(report);
  }

  async getReportsByExperiment(experimentId: string): Promise<Report[]> {
    await this.experimentSecurityLayer.getAndCheckAuthorizationToFindById(experimentId);

    return this.service.getReportsByExperiment(experimentId);
  }

}
