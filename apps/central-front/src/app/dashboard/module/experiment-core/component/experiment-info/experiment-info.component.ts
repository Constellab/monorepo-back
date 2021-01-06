import {Component, Input, OnInit} from '@angular/core';
import {Experiment} from '../../../../../core/model/entities/experiment.class';

@Component({
  selector: 'gen-experiment-info',
  templateUrl: './experiment-info.component.html',
  styleUrls: ['./experiment-info.component.scss']
})
export class ExperimentInfoComponent implements OnInit {

  @Input() experiment: Experiment;

  constructor() { }

  ngOnInit(): void {
  }

}
