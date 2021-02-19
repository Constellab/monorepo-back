import {Component, Input, OnInit} from '@angular/core';
import {BioxExperiment} from '../../../../model/entities/biox-experiment.entity';

@Component({
  selector: 'gen-biox-experiment-card',
  templateUrl: './biox-experiment-card.component.html',
  styleUrls: ['./biox-experiment-card.component.scss']
})
export class BioxExperimentCardComponent implements OnInit {

  @Input() experiment: BioxExperiment;

  constructor() {
    console.log(this.experiment);
  }

  ngOnInit(): void {
  }

}
