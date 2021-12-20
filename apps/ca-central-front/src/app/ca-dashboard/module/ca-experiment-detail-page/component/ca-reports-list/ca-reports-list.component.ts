import {Component, Input, OnInit} from '@angular/core';
import {CaReport} from '../../../../../ca-core/model/entities/ca-report.class';
import {CaReportService} from '../../../../../ca-core/service-api/ca-report.service';
import {FlArrayObs} from '@monorepo/front-core-lib';

/**
 * For the experiment detail page, it get the list of report and displays it
 */
@Component({
  selector: 'ca-reports-list',
  templateUrl: './ca-reports-list.component.html',
  styleUrls: ['./ca-reports-list.component.scss']
})
export class CaReportsListComponent implements OnInit {

  @Input() experimentId: string;

  reportsArray: FlArrayObs<CaReport>;


  constructor(private reportService: CaReportService) {
  }

  ngOnInit(): void {
    this.reportsArray = this.reportService.getReportsOfExperiment(this.experimentId);
  }
}
