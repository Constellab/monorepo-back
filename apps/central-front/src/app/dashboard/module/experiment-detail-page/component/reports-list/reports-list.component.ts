import {Component, Input, OnInit} from '@angular/core';
import {Report} from '../../../../../core/model/entities/report.class';
import {ReportService} from '../../../../service/report.service';
import {ArrayObs} from '../../../../../core/model/datasource/array-obs.class';

/**
 * For the experiment detail page, it get the list of report and displays it
 */
@Component({
  selector: 'gen-reports-list',
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss']
})
export class ReportsListComponent implements OnInit {

  @Input() experimentId: string;

  reportsArray: ArrayObs<Report>;


  constructor(private reportService: ReportService) {
  }

  ngOnInit(): void {
    this.reportsArray = this.reportService.getReportsOfExperiment(this.experimentId);
  }
}
