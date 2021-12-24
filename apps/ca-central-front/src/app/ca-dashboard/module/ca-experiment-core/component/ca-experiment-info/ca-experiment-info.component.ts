import {Component, Input, OnInit} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';

@Component({
  selector: 'ca-experiment-info',
  templateUrl: './ca-experiment-info.component.html',
  styleUrls: ['./ca-experiment-info.component.scss']
})
export class CaExperimentInfoComponent implements OnInit {

  @Input() experiment: CaExperiment;

  constructor() { }

  ngOnInit(): void {
  }

}
