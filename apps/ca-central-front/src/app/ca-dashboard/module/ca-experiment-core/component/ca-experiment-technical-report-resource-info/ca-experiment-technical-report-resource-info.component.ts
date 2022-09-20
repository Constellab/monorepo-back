import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ca-experiment-technical-report-resource-info',
  templateUrl: './ca-experiment-technical-report-resource-info.component.html',
  styleUrls: ['./ca-experiment-technical-report-resource-info.component.scss']
})
export class CaExperimentTechnicalReportResourceInfoComponent implements OnInit {

  @Input()
  resourceId: string;

  constructor() { }

  ngOnInit(): void {
    //TODO: Find a way to get the resource
  }

}
