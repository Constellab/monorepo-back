import {Component, Input, OnInit} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {CaTechnicalReport} from '../../../../../ca-core/model/entities/ca-technical-report.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaExperimentLabConfigDialogComponent
} from '../ca-experiment-lab-config-dialog/ca-experiment-lab-config-dialog.component';
import {Observable, Subject} from 'rxjs';
import {PrProcess, PrWorkflowEvent, PrWorkflowInputEvent} from '@monorepo/protocol';


@Component({
  selector: 'ca-experiment-technical-report',
  templateUrl: './ca-experiment-technical-report.component.html',
  styleUrls: ['./ca-experiment-technical-report.component.scss']
})
export class CaExperimentTechnicalReportComponent implements OnInit {

  @Input()
  experiment: CaExperiment;

  technicalReport: CaTechnicalReport;

  inputAction: Subject<PrWorkflowInputEvent> = new Subject<PrWorkflowInputEvent>();

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

  actionEvent(action: PrWorkflowEvent): void {
    //Action on workflow event
  }

  openLabConfigDialog(): void {
    this.dialogService.openSmallDialog(CaExperimentLabConfigDialogComponent, {data: this.experiment});
  }

  addProcessToWorkflow(typingName: string): void {
    const addProcessEvent: PrWorkflowInputEvent = {
      action: 'addProcess',
      addProcess: (protocolId: string) => {
        //Call the service to create a process from typingName and protocolId
        //return this.service.addProcess(typingName, protocolId)
        return new Observable<PrProcess>();
      }
    }
    this.inputAction.next(addProcessEvent);
  }


}
