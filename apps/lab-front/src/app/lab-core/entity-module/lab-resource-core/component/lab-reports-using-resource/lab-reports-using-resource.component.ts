import {Component, Input, OnInit} from '@angular/core';
import {LabReport, LabReportDatasource} from '../../../../model/entities/lab-report.entity';
import {FlEntityPaginatedDatasource, FlTableColumn} from '@monorepo/front-core-lib';
import {LabReportService} from '../../../../entity-service/lab-report.service';

/**
 * Component to list in a Table the reports that use a resource
 */
@Component({
  selector: 'lab-reports-using-resource',
  templateUrl: './lab-reports-using-resource.component.html',
  styleUrls: ['./lab-reports-using-resource.component.scss']
})
export class LabReportsUsingResourceComponent implements OnInit {

  @Input() resourceId: string;

  datasource: LabReportDatasource;

  columns: FlTableColumn<LabReport>[] = ['title', 'createdAt'];

  constructor(private reportService: LabReportService) { }

  ngOnInit(): void {
    this.getDatasource();
  }

  public getDatasource(): void {
    this.datasource = new FlEntityPaginatedDatasource(
      (page, pageSize) => this.reportService.getByResource(this.resourceId,
        page, pageSize),
      5
    );
  }

}
