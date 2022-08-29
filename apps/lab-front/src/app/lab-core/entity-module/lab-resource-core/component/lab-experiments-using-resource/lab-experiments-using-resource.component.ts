import {Component, Input, OnInit} from '@angular/core';
import {FlEntityPaginatedDatasource, FlTableColumn} from '@monorepo/front-core-lib';
import {LabExperimentService} from '../../../../entity-service/lab-experiment.service';
import {LabExperiment, LabExperimentDatasource} from '../../../../model/entities/lab-experiment.entity';

/**
 * Component to list in a Table the experiments that use a resource
 */
@Component({
  selector: 'lab-experiments-using-resource',
  templateUrl: './lab-experiments-using-resource.component.html',
  styleUrls: ['./lab-experiments-using-resource.component.scss']
})
export class LabExperimentsUsingResourceComponent implements OnInit {

  @Input() resourceId: string;

  datasource: LabExperimentDatasource;

  columns: FlTableColumn<LabExperiment>[] = ['title', 'status', 'tags'];

  constructor(private experimentService: LabExperimentService) {
  }

  ngOnInit(): void {
    this.getDatasource();
  }

  public getDatasource(): void {
    this.datasource = new FlEntityPaginatedDatasource(
      (page, pageSize) => this.experimentService.getByInputResource(this.resourceId,
        page, pageSize),
      5
    );
  }
}
