import {Component, Input, OnInit} from '@angular/core';
import {FlDatasource} from '@monorepo/front-core-lib';
import {LabRunningExperimentInfo} from '../../../../model/entities/lab-experiment.entity';

@Component({
  selector: 'lab-running-experiment-table',
  templateUrl: './lab-running-experiment-table.component.html',
  styleUrls: ['./lab-running-experiment-table.component.scss']
})
export class LabRunningExperimentTableComponent implements OnInit {

  @Input() datasource: FlDatasource<LabRunningExperimentInfo>;

  @Input() columns: string[];


  constructor() { }

  ngOnInit(): void {
  }

}
