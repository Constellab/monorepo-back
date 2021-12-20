import {Injectable} from '@nestjs/common';
import {CnAbstractSecurityLayer} from '../cn-core/class/cn-abstract-security.layer';
import {Report} from './cn-report.entity';
import {CnRefuseAuthorization} from '../cn-core/security/cn-refuse.authorization';
import {CnReportsService} from './cn-reports.service';
import {CnExperimentsSecurityLayer} from '../cn-experiments/cn-experiments-security-layer.service';

@Injectable()
export class CnReportsSecurityLayer extends CnAbstractSecurityLayer<Report> {

  constructor(private service: CnReportsService,
              private experimentSecurityLayer: CnExperimentsSecurityLayer) {
    super(service);
  }

  // not used
  async isAuthorizedToCreate(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: Report): Promise<boolean> {
    return this.experimentSecurityLayer.isAuthorizedToFindById(dbEntity.experimentId);
  }

  async isAuthorizedToUpdate(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
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
