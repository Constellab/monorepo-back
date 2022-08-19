import {Component, Input, OnInit} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaTechnicalReport} from '../../../../../ca-core/model/entities/ca-technical-report.class';
import {FlDialogService, FlPortalActionResult} from '@monorepo/front-core-lib';
import {
  CaExperimentLabConfigDialogComponent
} from '../ca-experiment-lab-config-dialog/ca-experiment-lab-config-dialog.component';
import {Observable, Subscription} from 'rxjs';
import {PrWorkflowEvent} from '@monorepo/protocol';


@Component({
  selector: 'ca-experiment-technical-report',
  templateUrl: './ca-experiment-technical-report.component.html',
  styleUrls: ['./ca-experiment-technical-report.component.scss']
})
export class CaExperimentTechnicalReportComponent implements OnInit {

  @Input()
  experiment: CaExperiment;

  technicalReport: CaTechnicalReport;

  constructor(
    private experimentService: CaExperimentService,
    private dialogService: FlDialogService
  ) {
  }

  ngOnInit(): void {
    this.experimentService.getExperimentTechnicalReport(this.experiment.id).subscribe((res: CaTechnicalReport) => {
      this.technicalReport = res;
    });
  }

  actionEvent(action: PrWorkflowEvent): void{
    console.log('BLABLA', action);
  }

  openLabConfigDialog(): void {
    this.dialogService.openSmallDialog(CaExperimentLabConfigDialogComponent, {data: this.experiment});
  }

}
