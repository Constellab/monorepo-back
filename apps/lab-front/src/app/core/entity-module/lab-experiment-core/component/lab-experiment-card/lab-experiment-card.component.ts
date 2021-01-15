import {Component, Input, OnInit} from '@angular/core';
import {LabExperiment} from '../../../../model/entities/lab-experiment.entity';

@Component({
  selector: 'gen-lab-experiment-card',
  templateUrl: './lab-experiment-card.component.html',
  styleUrls: ['./lab-experiment-card.component.scss']
})
export class LabExperimentCardComponent implements OnInit {

  @Input() experiment: LabExperiment;

  constructor() {
  }

  ngOnInit(): void {
  }

}
